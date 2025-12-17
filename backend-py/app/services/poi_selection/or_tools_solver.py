from ortools.constraint_solver import routing_enums_pb2
from ortools.constraint_solver import pywrapcp
import sys
import traceback

# Function that works with google OR tools and returns selected best points to visit on the route
def or_tools_choose_pois(or_data):

    try:
        # Convert all variables to int for safety because or tools has a problem with floats

        # Convert target distance to meters (to match the distance matrix)
        max_distance_meters = int(float(or_data.max_distance) * 1000 )

        # Define the basic variables
        num_points = int(len(or_data.points))
        start_node = int(or_data.start_index)
        end_node = int(or_data.end_index)

        # Define a manager (1 means we have only one vehicle)
        or_manager = pywrapcp.RoutingIndexManager(
            num_points, 
            1, 
            [start_node], 
            [end_node]
        )

        # Define routing model
        or_routing = pywrapcp.RoutingModel(or_manager)

        # Find the internal index or tools for the end point of the route (0 means it is for our one (single) vehicle)
        routing_end = or_routing.End(0)




        # Go through all points (nodes) indexes
        for node_index in range(num_points):

            # Skip the start and end point.
            if node_index == start_node or node_index == end_node:
                continue
            
            # Convert our node index to internal or tools index
            or_index = or_manager.NodeToIndex(node_index)

            # Checking if it is not -1
            if or_index >= 0:
                # Load our calculated score per point
                score = or_data.scores[node_index]
                # Raise its importance score and get a higher penalty for missing a point
                score_penalty = (score * or_data.score_weight)
                # Allow a point to be omitted, but with a penalty
                or_routing.AddDisjunction([or_index], int(score_penalty))




        # Create distance callback function
        def distance_callback(from_index, to_index):
            # Just convert internal indexes or tools to our index and call our function
            return or_data.distance_callback(
                or_manager.IndexToNode(from_index), 
                or_manager.IndexToNode(to_index)
            )
        
        # Tell or tools to use our function to calculate the distance
        distance_callback_index = or_routing.RegisterTransitCallback(distance_callback)




        # Now let's try to prevent the solver from creating uneven spacing between points.

        # Load the number of points to be on the route.
        pois_count = int(or_data.target_pois_count)
        # Calculate the ideal distance between the points if they were spaced perfectly evenly.
        ideal_segment_length = max_distance_meters / (pois_count + 1)
        
        # We define a tolerance for uneven distribution for which we will not punish yet.
        balanced_threshold = ideal_segment_length * or_data.balanced_threshold_multiplier

        # Create a new distance function that will penalize for uneven point distribution
        # The penalty is that instead of the real distance we say longer, the solver doesn't want that.
        def balanced_cost_callback(from_index, to_index):

            # Get real distance
            # Convert internal or tools indexes to our indexes and call our function
            dist = or_data.distance_callback(
                or_manager.IndexToNode(from_index), 
                or_manager.IndexToNode(to_index)
            )
            
            # If the threshold is exceeded, we apply a penalty
            if dist > balanced_threshold:

                # Calculate the excess over the threshold
                excess = dist - balanced_threshold

                # For the calculation use quadratic growth
                # Small deviations -> negligible penalty, large deviations -> very large penalty
                # Using balanced_penalty_strength we can control the strength of the penalty
                # Formula: (excess^2 / 1000) * balanced_penalty_strength
                penalty = ((excess * excess) / 1000) * or_data.balanced_penalty_strength
                
                # Finally, we will lie to the solver and tell it a greater distance than it really is (if it has exceeded the threshold)
                return int(dist + penalty)
            
            return int(dist)

        balanced_callback_index = or_routing.RegisterTransitCallback(balanced_cost_callback)

        # Tell the solver that it basically tries to take the shortest route,but for uneven spacing, a greater distance is punished.
        or_routing.SetArcCostEvaluatorOfAllVehicles(balanced_callback_index)




        # Add a new dimension for distance
        or_routing.AddDimension(
            distance_callback_index, # Funkciton to get distance (A - B)
            0, # Slack = 0, no overlap allowed
            sys.maxsize, # Infinite distance capacity
            True, # Distance starts at 0
            "Distance" # Name
        )

        # Get distance dimension object
        distance_dimension = or_routing.GetDimensionOrDie("Distance")
        


        # Set penalty for distance longer than max_distance_meters
        distance_dimension.SetCumulVarSoftUpperBound(
            routing_end,          # # Distance checks at the end of the route
            max_distance_meters,  # The distance for which there is no penalty is max distance or shorter
            or_data.distance_penalty  # Penalty for every meter the route is longer
        )



        # Callback function that lets the solver know if a point counts towards the total number of points or not
        def poi_count_callback(from_index):
            # Convert internal or tools index to our node index
            node_index = or_manager.IndexToNode(from_index)
            # Call function that returns start and end nodes are not included in the total (returns 0)
            return or_data.poi_callback(node_index)

        # Register a callback function for points and get its index
        poi_callback_index = or_routing.RegisterUnaryTransitCallback(poi_count_callback)

        # Create a dimension for the number of points
        or_routing.AddDimension(
            poi_callback_index, # How much for each point (0 for start/end 1 for poi)
            0, # Slack = 0, no overlap allowed
            num_points, # The maximum value is the number of all points.
            True, # Starts at 0
            "POIs" # Name
        )

        # Get POIs dimension object
        poi_dimension = or_routing.GetDimensionOrDie("POIs")
        
        # At the end of the route, there must be exactly the specified number of points (no other option)
        poi_dimension.CumulVar(routing_end).SetValue(int(or_data.target_pois_count))





        # Solving problem:
        # Create a configuration object with solution parameters
        or_solution_params = pywrapcp.DefaultRoutingSearchParameters()

        #Create the first completely stupid solution, it will start with that and it will improve it
        or_solution_params.first_solution_strategy = routing_enums_pb2.FirstSolutionStrategy.GLOBAL_CHEAPEST_ARC

        # Then gradually improve and look for better and better routes with the help of heuristics
        or_solution_params.local_search_metaheuristic = routing_enums_pb2.LocalSearchMetaheuristic.GUIDED_LOCAL_SEARCH

        # Set a time limit (from the config) for how long the solver should search and improve the route
        or_solution_params.time_limit.seconds = int(or_data.time_limit)
        
        # Start server to get or_solution
        or_solution = or_routing.SolveWithParameters(or_solution_params)




        # Extract results

        # If or_solution is not none (if a route was found)
        if or_solution:
            selected_pois = []        # Array for poi only (without start/end)
            segment_coordinates = []  # Coordinates of the entire route (including start/end)
            selected_ids = []         # Only poi ids (without start/end)

            # Set the index to the start point (0 is our only one vehicle)
            index = or_routing.Start(0)
            
            # Go through all selected points, while true simulates do while in python
            while True:

                # Convert the internal or tools index to our node index
                node_index = or_manager.IndexToNode(index)
                
                # Add the coordinates of the point (get them using the index from our array)
                segment_coordinates.append(or_data.points_coordinates[node_index])
                
                # Check if the point is poi using our function
                if or_data.poi_callback(node_index) == 1:
                    # Add poi to array (get them using the index from our array)
                    poi_dict = or_data.points[node_index]
                    selected_pois.append(poi_dict)

                    # Create data where only the id of the poi will be

                    # Structure if it is a cluster
                    if poi_dict["type"] == "cluster":
                        poi_ids = [poi["poi"].id for poi in poi_dict["poi_data"]]
                        selected_ids.append({
                            "type": "cluster",
                            "poi_ids": poi_ids,
                            "geom": poi_dict["geom"],
                            "best_poi_id": poi_dict["best_poi_id"]
                        })

                    # Structure if it is a single poi
                    else:
                        selected_ids.append({
                            "type": "poi",
                            "poi_id": poi_dict["poi_data"]["poi"].id,
                        })

                # If the point is end, end the loop
                if or_routing.IsEnd(index):
                    break

                # Set the index to the next point
                index = or_solution.Value(or_routing.NextVar(index))

            # Return a dictionary with data
            return {
                "selected_ids": selected_ids, # Only poi ids
                "selected_pois": selected_pois, # Only poi without start/end
                "segment_coordinates": segment_coordinates, # All coordinates, with start/end
            }   
        else:
            return None # If the solver found nothing, return none

    except Exception as e:
        # To be safe, we catch errors so that the server doesn't crash.
        traceback.print_exc()
        return {"error": str(e)}