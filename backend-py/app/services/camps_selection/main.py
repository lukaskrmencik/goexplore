from app.models.select_camps_models import SelectCampsRequest
from shapely.geometry import LineString
from .divide_axis import split_axis_to_days
from .choose_camps import choose_camps



# Function for selecting points for camps on the route and selecting the best camps.
def select_camps_service(request: SelectCampsRequest):
    
    # variable definition
    camps = request.camps
    # Axis is a rough outline of a route on a map
    axis_coords = request.axis.coordinates
    axis = LineString(axis_coords)
    days = request.days
    config_scores = request.scores
    DEFAULT_CAMP_SEASON = request.DEFAULT_CAMP_SEASON
    
    # Use the function to find ideal points on the route for camps.
    axis_days = split_axis_to_days(axis,days)
    # Axis segments are the route segments between the start, camps, and end.
    axis_segments = axis_days["segments"]
    # We get ideal camps, which are places on the route around which we will look for a campsite.
    ideal_camps = axis_days["ideal_camps"]

    # Call a function that will select the best camps
    best_camps, groups_camps_score = choose_camps(ideal_camps, camps, config_scores, days, DEFAULT_CAMP_SEASON)

    # Trim the array of unnecessary information and return only the selected camps array
    selected_camps = [camp_data["best_camp"]["camp"] for camp_data in best_camps]

    selected_camps_ids = [camp.id for camp in selected_camps]

    # return results
    return {
        "best_camps": best_camps,
        "selected_camps": selected_camps,
        "axis_segments": axis_segments,
        "selected_camps_ids": selected_camps_ids 
    }
