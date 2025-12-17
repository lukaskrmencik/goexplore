from shapely.geometry import Point, LineString
from app.utils.general import normalize, review_weighted_rating


def calc_poi_scores(single_segment, axis, CONFIG_SCORES):
    poi_distances = calc_poi_distances(single_segment.poi,axis)

    poi_scores = []
    min_avarage_max_normalization = min_avarage_max_normalization_values(poi_distances)

    for poi_distance in poi_distances:
        score = calc_poi_score(poi_distance, CONFIG_SCORES, min_avarage_max_normalization)
        poi_scores.append(
            {
                "poi": poi_distance["poi"],
                "distance": poi_distance["distance"],
                "score": score
            }
        )

    return poi_scores


def calc_poi_distances(pois,axis):

    poi_distances = []
    axis_linestring = LineString(axis.coordinates)

    for poi in pois:
        poi_point = Point(poi.geom.coordinates[0], poi.geom.coordinates[1])
        distance = poi_point.distance(axis_linestring)
        poi_distances.append(
            {
                "poi": poi,
                "distance": distance
            }
        )

    return poi_distances


# Function to get min, avarage and max values ​​for reviews, review counts and distances for normalization and Bayesian weighted rating  purposes
def min_avarage_max_normalization_values(pois):
    reviews = []
    review_counts = []
    distances = []

    # We create an arrays of all values
    for poi_obj in pois:
        poi = poi_obj["poi"]

        # if not none, add value to array
        if poi.review is not None:
            reviews.append(int(poi.review))

        if poi.review_count is not None:
            review_counts.append(int(poi.review_count))

        distances.append(poi_obj["distance"])

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


def calc_poi_score(poi_distance, config_scores, min_avarage_max_normalization):
    data_score = 0

    poi_data = poi_distance["poi"]
    distance = poi_distance["distance"]

    data_score_config = config_scores.data
    distance_score_config = config_scores.distance

    if poi_data.has_opening_hours:
        data_score += data_score_config.has_opening_hours.weight

    if poi_data.website is not None:
        data_score += data_score_config.website.weight

    if all([
        poi_data.review_count is not None,
        min_avarage_max_normalization["review_count"]["min"] is not None,
        min_avarage_max_normalization["review_count"]["max"] is not None,
    ]):
        normalized_review_count = normalize(
            poi_data.review_count,
            min_avarage_max_normalization["review_count"]["min"],
            min_avarage_max_normalization["review_count"]["max"]
        )

        data_score += data_score_config.review_count.weight * normalized_review_count
    

    if all([
        poi_data.review is not None,
        poi_data.review_count is not None,
        min_avarage_max_normalization["review"]["avarage"] is not None,
        min_avarage_max_normalization["review_count"]["avarage"] is not None,
    ]):

        weighted_review = review_weighted_rating(
            poi_data.review,
            poi_data.review_count, 
            min_avarage_max_normalization["review_count"]["avarage"], 
            min_avarage_max_normalization["review"]["avarage"]
        )

        normalized_review = normalize(
            weighted_review,
            data_score_config.review.min,
            data_score_config.review.max,
        )

        data_score += data_score_config.review.weight * normalized_review

    if poi_data.article_popularity is not None:
        normalized_article_popularity = normalize(
            poi_data.article_popularity,
            data_score_config.article_popularity.min,
            data_score_config.article_popularity.max,
        )

        data_score += data_score_config.article_popularity.weight * normalized_article_popularity
    

    normalized_distance = normalize(
        distance,
        min_avarage_max_normalization["distance"]["max"],
        min_avarage_max_normalization["distance"]["min"]
    )

    total_score = data_score_config.weight * data_score + distance_score_config.weight * normalized_distance
    
    return int(round(total_score * 100))