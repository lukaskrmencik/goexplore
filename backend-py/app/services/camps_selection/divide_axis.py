from shapely.geometry import mapping
from shapely.ops import substring


# A function that divides the axis into segments according to the length of individual days and calculates the positions of ideal camps.
def split_axis_to_days(axis,days):

    axis_length = axis.length
    # Make the array the with percentage of the day from the whole day
    days_percents_of_full = [day.timePercentOfFull for day in days]
    # Sum all percentages to get the total ratio
    total_ratio = sum(days_percents_of_full)
    # We calculate the normalized percentage of the route by day length
    days_ratios = [day_percent / total_ratio for day_percent in days_percents_of_full]
    # From the days ratios and the length of the entire route, we can calculate the route length for individual days.
    segment_lengths = [ratio * axis_length for ratio in days_ratios]

    # call functions to divide the route into segments (get coordinates list)
    segments = divide_segments(segment_lengths, axis)
    # call functions to get ideal camps coordinates
    ideal_camps = ideal_camps_coords(segment_lengths, axis)

    return {
        "segments": segments,
        "ideal_camps": ideal_camps
    }



# Function that divides a axis into individual segments by day (returns a list of coordinates)
def divide_segments(segment_lengths, axis):

    segments = []
    segment_start = 0

    # Go through the individual segments
    for segment_length in segment_lengths:
        segment_end = segment_start + segment_length
        # Using the substring function, we get a cut of the route from start to end.
        segment_linestring = substring(axis, segment_start, segment_end)
        segments.append(mapping(segment_linestring))  
        # Update the start for the next iterationt
        segment_start = segment_end

    return segments



# Function for calculating the coordinates of ideal camps
def ideal_camps_coords(segment_lengths, axis):
    current_distance = 0
    ideal_camps = []

    # Go through the individual segments except the last one (we don't need an ideal camp at the end)
    for segment_length in segment_lengths[:-1]:
        current_distance += segment_length
        # Using the interpolate function, we can find a point on the route after a certain distance.
        camp_point = axis.interpolate(current_distance)
        ideal_camps.append(camp_point)

    return ideal_camps
