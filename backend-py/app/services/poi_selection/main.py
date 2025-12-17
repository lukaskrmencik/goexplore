from app.models.select_poi_models import SelectPoiRequest
from shapely.geometry import Point, LineString
from .calc_scores import calc_poi_scores
from .choose_best_pois import choose_best_pois
from .calc_full_route import calc_full_route
from fastapi import HTTPException
from app.utils.general import set_job_progress

async def select_poi_service(request: SelectPoiRequest):

    segments_poi = request.segments_poi
    axis = request.axis
    PERCENTAGE_OF_CALC_POIS = request.PERCENTAGE_OF_CALC_POIS
    MAX_NUMBER_OF_CALC_POIS = request.MAX_NUMBER_OF_CALC_POIS
    pois_per_day = request.poi_per_day
    max_route_length_day = request.max_route_length_day
    days = request.days
    OSRM_SERVER_URL = request.OSRM_SERVER_URL
    CONFIG_SCORES = request.scores
    OR_TOOLS_CONFIG = request.OR_TOOLS_CONFIG
    CLUSTER_SIZE_KM = request.CLUSTER_SIZE_KM
    EARTH_RADIUS_KM = request.EARTH_RADIUS_KM
    REDIS_CONFIG = request.REDIS_CONFIG
    job_id = request.job_id

    or_solution = None

    segments_selected_pois = []
    segments_coordinates = []
    segments_selected_poi_ids = []

    for segment_index, single_segment in enumerate(segments_poi):

        poi_scores = calc_poi_scores(single_segment, axis, CONFIG_SCORES)

        set_job_progress(job_id, 12 + round(63 * (segment_index / len(segments_poi))), "running", REDIS_CONFIG)

        or_solution = await choose_best_pois(    
            poi_scores, 
            single_segment.start,
            single_segment.end,
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
            EARTH_RADIUS_KM,
        )

        if(or_solution != None):
            segments_selected_pois.append(or_solution["selected_pois"])
            segments_coordinates.append(or_solution["segment_coordinates"])
            segments_selected_poi_ids.append(or_solution["selected_ids"])

        else:
            raise HTTPException(
                status_code=404,
                detail="Route not found"
            )
        
    set_job_progress(job_id, 95, "running", REDIS_CONFIG)

    full_route = calc_full_route(segments_coordinates, OSRM_SERVER_URL)

    set_job_progress(job_id, 97, "running", REDIS_CONFIG)

    # return results
    return {
        "segments_selected_poi_ids": segments_selected_poi_ids,
        "segments_selected_pois": segments_selected_pois,
        "full_route": full_route
    }





