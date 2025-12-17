from concurrent.futures import ThreadPoolExecutor
from fastapi.concurrency import run_in_threadpool
from app.utils.general import km_to_radians, normalize
import polyline
import requests
from sklearn.cluster import DBSCAN
from app.models.general_models import Geom
from .or_tools_solver import or_tools_choose_pois
import numpy as np


async def choose_best_pois(
    poi_scores, 
    start_point,
    end_point,
    pois_per_day,
    max_route_length_day,
    days,
    segment_index,
    PERCENTAGE_OF_CALC_POIS,
    MAX_NUMBER_OF_CALC_POIS,
    OSRM_SERVER_URL,
    OR_TOOLS_CONFIG,
    CONFIG_SCORES,
    CLUSTER_SIZE_KM,
    EARTH_RADIUS_KM
):

    max_distance = max_route_length_day * days[segment_index].timePercentOfFull
    target_pois_count = round(pois_per_day * days[segment_index].timePercentOfFull)

    top_poi_scores = cut_and_sort_poi_list(poi_scores, PERCENTAGE_OF_CALC_POIS, MAX_NUMBER_OF_CALC_POIS)

    final_pois = calc_poi_clustering(top_poi_scores, CONFIG_SCORES, CLUSTER_SIZE_KM, EARTH_RADIUS_KM)


    or_data = ORToolsData(
        final_pois,
        start_point,
        end_point, 
        target_pois_count,
        max_distance,  
        OSRM_SERVER_URL,
        OR_TOOLS_CONFIG
    )

    def run_or_tools():
        return or_tools_choose_pois(or_data)

    or_solution = await run_in_threadpool(run_or_tools)

    return or_solution



def cut_and_sort_poi_list(poi_scores, PERCENTAGE_OF_CALC_POIS, MAX_NUMBER_OF_CALC_POIS):

    pois_scores_sorted = sorted(poi_scores, key=lambda poi_score: poi_score['score'], reverse=True) 
    top_poi_scores = pois_scores_sorted[:int(len(pois_scores_sorted)*PERCENTAGE_OF_CALC_POIS)]

    top_poi_scores = top_poi_scores[:MAX_NUMBER_OF_CALC_POIS]

    return top_poi_scores


def calc_poi_clustering(top_poi_scores, CONFIG_SCORES, CLUSTER_SIZE_KM, EARTH_RADIUS_KM):

    pois_rad = top_poi_scores_to_rad(top_poi_scores)

    eps_rad = km_to_radians(CLUSTER_SIZE_KM, EARTH_RADIUS_KM)

    db = DBSCAN(eps=eps_rad, min_samples=1, metric='haversine')
    labels = db.fit_predict(pois_rad)

    clusters_dict = {}
    for index, cluster_id in enumerate(labels):
        if cluster_id not in clusters_dict:
            clusters_dict[cluster_id] = []
        clusters_dict[cluster_id].append(top_poi_scores[index])

    poi_clustering = []
    for cluster_id, cluster_poi_scores in clusters_dict.items():

        if len(cluster_poi_scores) == 1:  
            poi_clustering.append({
                "type": "poi",
                "poi_data": cluster_poi_scores[0],
                "score": cluster_poi_scores[0]["score"],
                "geom": cluster_poi_scores[0]["poi"].geom.dict()
            })

        else:
            cluster_points_deg = np.array(
                [
                    poi_score["poi"].geom.coordinates
                    for poi_score in cluster_poi_scores
                ]
            )

            center = cluster_points_deg.mean(axis=0)

            best_poi = max(cluster_poi_scores, key=lambda poi: poi["score"])
            best_poi_id = best_poi["poi"].id

            cluster_score = calc_cluster_score(
                cluster_poi_scores,
                top_poi_scores, 
                CONFIG_SCORES.CLUSTER_BONUS_THRESHOLD_PERCENT,
                CONFIG_SCORES.CLUSTER_BONUS_WEIGHT
            )

            poi_clustering.append({
                "type": "cluster",
                "geom": {
                    "type": "Point",
                    "coordinates": center.tolist()
                },
                "poi_data": cluster_poi_scores,
                "best_poi_id": best_poi_id,
                "score": cluster_score
            })
    
    return poi_clustering


def calc_cluster_score(pois, all_pois, CLUSTER_BONUS_THRESHOLD_PERCENT, CLUSTER_BONUS_WEIGHT):

    best_poi = max(pois, key=lambda poi: poi["score"])
    
    other_pois = pois.copy()
    other_pois.remove(best_poi)

    other_pois_average_score = sum(poi["score"] for poi in other_pois) / len(other_pois)

    average_score = sum(poi["score"] for poi in all_pois) / len(all_pois)
    max_score = max(poi["score"] for poi in all_pois)

    bonus_threshold = average_score * CLUSTER_BONUS_THRESHOLD_PERCENT

    if other_pois_average_score < bonus_threshold:
        cluster_bonus = 0
    else:
        cluster_bonus = normalize(other_pois_average_score, bonus_threshold, max_score)

    score_weight = 1 - CLUSTER_BONUS_WEIGHT

    cluster_score = score_weight * best_poi["score"] + CLUSTER_BONUS_WEIGHT * cluster_bonus

    return cluster_score
    



def top_poi_scores_to_rad(top_poi_scores):

    pois_coords = np.array([
        top_poi_score["poi"].geom.coordinates
        for top_poi_score in top_poi_scores
    ])

    pois_rad = np.radians(pois_coords)

    return pois_rad



def osrm_distance_matrix(points, OSRM_SERVER_URL):

    points_latlon = [(lat, lon) for lon, lat in points]

    points_polyline = polyline.encode(points_latlon, precision=5)

    url = f"{OSRM_SERVER_URL}/table/v1/driving/polyline({points_polyline})?annotations=distance"

    response = requests.get(url)
    if response.status_code != 200:
        raise Exception(f"Chyba OSRM API: {response.status_code} {response.text}")

    distances_float = response.json()["distances"]
    distances_int = [[int(round(dist)) for dist in dist_row] for dist_row in distances_float]

    return distances_int



class ORToolsData:
    def __init__(self, final_pois, start_point, end_point, target_pois_count, max_distance, OSRM_SERVER_URL,OR_TOOLS_CONFIG):

        self.balanced_threshold_multiplier = OR_TOOLS_CONFIG.balanced_threshold_multiplier
        self.balanced_penalty_strength = OR_TOOLS_CONFIG.balanced_penalty_strength
        self.time_limit = OR_TOOLS_CONFIG.time_limit
        self.score_weight = OR_TOOLS_CONFIG.score_weight
        self.distance_penalty = OR_TOOLS_CONFIG.distance_penalty
        self.start_point = start_point
        self.target_pois_count = target_pois_count
        self.max_distance = max_distance
        self.end_point = end_point
        self.points = [start_point] + final_pois + [end_point]

        self.scores = [0] + [poi["score"] for poi in final_pois] + [0]
        self.start_index = 0
        self.end_index = len(self.points) - 1
        self.poi_indexes = list(range(1, self.end_index))

        self.points_coordinates = []
        for point in self.points:
            if isinstance(point, Geom):
                self.points_coordinates.append(point.coordinates)
            else:
                self.points_coordinates.append(point["geom"]["coordinates"])

        self.distance_matrix = osrm_distance_matrix(self.points_coordinates, OSRM_SERVER_URL)

    def distance_callback(self, from_index, to_index):
        return self.distance_matrix[from_index][to_index]

    def poi_callback(self, node_index):
        return 1 if node_index in self.poi_indexes else 0

    def score_callback(self, node_index):
        return self.scores[node_index]