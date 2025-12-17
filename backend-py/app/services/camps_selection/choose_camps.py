from shapely.geometry import Point
from app.utils.general import normalize, review_to_float, review_weighted_rating
from fastapi import HTTPException
from datetime import date


# function for selecting the best campsites on the route
def choose_camps(ideal_camps, camps, config_scores, days, DEFAULT_CAMP_SEASON):

    # We will divide the camps into groups according to which ideal campsite they are closest to.
    camp_groups = camp_groups_by_ideal_camp(camps, ideal_camps, days, DEFAULT_CAMP_SEASON)

    # Create a new array for storing camp scores with division by groups.
    groups_camps_score = []

    # for in camp groups
    for group_index, camp_group in enumerate(camp_groups):

        # We will add basic data to the new array
        groups_camps_score.append({
            "ideal_camp": camp_group["ideal_camp"],
            "camp_scores": []
        })

        # for in camps in camp group
        for camp in camp_group["camps"]:

            # Calling a function to get the minimum, avarage and maximum values ​​for some data, for normalization purposes
            min_avarage_max_normalization = min_avarage_max_normalization_values(camp_group["camps"])

            # Calling a function to calculate the camp score
            camp_score = calc_camp_score(camp, config_scores, min_avarage_max_normalization)

            # Adding camp score data to the new array
            groups_camps_score[group_index]["camp_scores"].append({
                "camp": camp["camp_data"],
                "score": camp_score,
                "ideal_camp_distance": camp["ideal_camp_distance"]
            })

        # Now we will select the best camps from each group
        best_camps = []

        #for in groups camps score
        for camp_group in groups_camps_score:
            camp_scores = camp_group["camp_scores"]

            # if no camps, skip
            if not camp_scores:
                continue

            # select the camp with the highest score
            best_camp = max(camp_scores, key=lambda x: x["score"])

            # add to array
            best_camps.append({
                "ideal_camp": camp_group["ideal_camp"],
                "best_camp": best_camp
            })

    return best_camps, groups_camps_score



# Function for dividing the camps into groups according to which ideal campsite is closest
# This feature prevents them from choosing the same campsites for 2 nights.
def camp_groups_by_ideal_camp(camps, ideal_camps,days, DEFAULT_CAMP_SEASON):

    camp_groups = []

    # Prepare the basic data
    for ideal_camp in ideal_camps:
        camp_groups.append({
            "ideal_camp": [ideal_camp.x, ideal_camp.y],
            "camps": []
        })

    # for in camps
    for camp in camps:

        # We create a shapely point for the camp
        camp_point = Point(camp.geom.coordinates[0], camp.geom.coordinates[1])
        
        # We find the closest ideal camp to the camp
        closest_ideal_camp_index, closest_ideal_camp = min(
            enumerate(ideal_camps), 
            key=lambda x: x[1].distance(camp_point)
            )

        # We check whether the camp is open during the night between the days assigned to the ideal camp
        if is_night_in_camp_season(
            days[closest_ideal_camp_index],
            days[closest_ideal_camp_index + 1],
            camp,
            DEFAULT_CAMP_SEASON
        ):

            # Measure the distance to the ideal campsite
            ideal_camp_distance = camp_point.distance(closest_ideal_camp)

            # We add the camp to the group of the closest ideal camp
            camp_groups[closest_ideal_camp_index]["camps"].append({
                "camp_data": camp,
                "camp_point": [camp_point.x, camp_point.y],
                "ideal_camp_distance": ideal_camp_distance
            })

    # If any group has no camps, we raise an error
    for camp_group in camp_groups:
        if not camp_group["camps"]:
            raise HTTPException(status_code=404, 
                detail="Unable to calculate route, there are no camps in the area"
            )

    return camp_groups



# Function to get min, avarage and max values ​​for reviews, review counts and distances for normalization and Bayesian weighted rating  purposes
def min_avarage_max_normalization_values(camps):
    reviews = []
    review_counts = []
    distances = []

    # We create an arrays of all values
    for camp_obj in camps:
        camp = camp_obj["camp_data"]

        # if not none, add value to array
        if camp.review is not None:
            reviews.append(review_to_float(camp.review))

        if camp.review_count is not None:
            review_counts.append(int(camp.review_count))

        distances.append(camp_obj["ideal_camp_distance"])

    # Return calculated min, avarage and max values
    return {
        "review": {
            "min": min(reviews) if reviews else None,
            "avarage": sum(reviews) / len(reviews) if reviews else None,
            "max": max(reviews) if reviews else None
        },
        "review_count": {
            "min": min(review_counts) if review_counts else None,
            "avarage": sum(review_counts) / len(review_counts) if review_counts else None,
            "max": max(review_counts) if review_counts else None
        },
        "distance": {
            "min": min(distances) if distances else None,
            "avarage": sum(distances) / len(distances) if distances else None,
            "max": max(distances) if distances else None
        }
    }




# function to calculate camp score
def calc_camp_score(camp, config_scores, min_avarage_max_normalization):

    # data score is a score calculated from the data we know about the camp
    data_score = 0

    #variables definition
    camp_data = camp["camp_data"]
    # we load the config to obtain the weights of parameters
    data_score_config = config_scores.data
    distance_score_config = config_scores.distance

    # all score values ​​we add can be from 0 to 1 and importance is determined by weight
    # The scales are also from 0 to 1. The sum of all weights is 1

    # if the campsite has a photo, we add 1 * weight else 0
    if camp_data.image_url is not None:
        data_score += data_score_config.image.weight

    # If we know the opening hours, we add 1 * weight else 0
    if camp_data.operating_time_month_from is not None:
        data_score += data_score_config.operating_time.weight

    # If the campsite has a website, we add 1 * weight else 0
    if camp_data.web is not None:
        data_score += data_score_config.web.weight

    # We check whether the defined data is necessary for review count
    if all([
        camp_data.review_count is not None,
        min_avarage_max_normalization["review_count"]["min"] is not None,
        min_avarage_max_normalization["review_count"]["max"] is not None,
    ]):
        # We normalize the number of reviews to a value of 0 - 1 using min and max
        normalized_review_count = normalize(
            camp_data.review_count,
            min_avarage_max_normalization["review_count"]["min"],
            min_avarage_max_normalization["review_count"]["max"]
        )

        # add score * weight
        data_score += data_score_config.review_count.weight * normalized_review_count
    

    # We check whether the defined data is necessary for review score
    if all([
        camp_data.review is not None,
        camp_data.review_count is not None,
        min_avarage_max_normalization["review"]["avarage"] is not None,
        min_avarage_max_normalization["review_count"]["avarage"] is not None,
    ]):

        # Now we calculate the Bayesian weighted rating
        weighted_review = review_weighted_rating(
            review_to_float(camp_data.review),
            camp_data.review_count, 
            min_avarage_max_normalization["review_count"]["avarage"], 
            min_avarage_max_normalization["review"]["avarage"]
        )

        # We normalize the weighted review to a value of 0 - 1 using with min and max from config
        normalized_review = normalize(
            weighted_review,
            data_score_config.review.min,
            data_score_config.review.max,
        )

        # add score * weight
        data_score += data_score_config.review.weight * normalized_review



    # Now we calculate the distance score
    
    # We normalize the distance but invert the min and max values ​​because the shorter the distance, the better the score
    normalized_distance = normalize(
            camp["ideal_camp_distance"],
            min_avarage_max_normalization["distance"]["max"],
            min_avarage_max_normalization["distance"]["min"]
    )

    # total score is the sum of data score and distance score with their weights
    total_score = data_score_config.weight * data_score + distance_score_config.weight * normalized_distance
    
    return total_score



# Function to check if a campsite is open on a specific date
def is_date_in_camp_season(check_date: date, camp, DEFAULT_CAMP_SEASON):

    # variables definition if camp has operating time, use it, else use default season
    open_month = camp.operating_time_month_from or DEFAULT_CAMP_SEASON.open_month
    open_day = camp.operating_time_day_from or DEFAULT_CAMP_SEASON.open_day
    close_month = camp.operating_time_month_to or DEFAULT_CAMP_SEASON.close_month
    close_day = camp.operating_time_day_to or DEFAULT_CAMP_SEASON.close_day
    start = date(check_date.year, open_month, open_day)
    end = date(check_date.year, close_month, close_day)


    # If the regular season is only within one year
    if start <= end:
        # check if the date is within the season
        return start <= check_date <= end
    
    # If the camp season exceeds 2 years
    else: 
        # if the check date is before the end of the year.
        if check_date >= start:
            return True
        # If the check date is after the end of the year but before the end of the season
        elif check_date <= end:
            return True

    # If none of the conditions are met - the camp is not in operation on this date
    return False

def is_night_in_camp_season(day_evening, day_morning, camp, DEFAULT_CAMP_SEASON):

    # get morning and evening dates
    evening_date = day_evening.endDatetime.date()
    morning_date = day_morning.startDatetime.date()

    # check if both dates are in camp season
    evening_check = is_date_in_camp_season(evening_date, camp, DEFAULT_CAMP_SEASON)
    morning_check = is_date_in_camp_season(morning_date, camp, DEFAULT_CAMP_SEASON)
    return evening_check and morning_check