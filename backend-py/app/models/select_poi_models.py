from pydantic import BaseModel
from typing import List, Optional    
from .general_models import Day, ScoreWeight, Geom, Axis, RedisConfig

class PoiDataScore(BaseModel):
    weight: float
    review: ScoreWeight
    review_count: ScoreWeight
    article_popularity: ScoreWeight
    has_opening_hours: ScoreWeight
    website: ScoreWeight

class PoiScores(BaseModel):
    data: PoiDataScore
    distance: ScoreWeight
    CLUSTER_BONUS_THRESHOLD_PERCENT: float
    CLUSTER_BONUS_WEIGHT: float

class Poi(BaseModel):
    id: int
    name: str
    kudyznudy_url: str
    lat: float
    lon: float
    image_url: Optional[str] = None
    review: float
    review_count: int
    article_popularity: int
    time_required: float
    price: Optional[float]
    discounted_price: Optional[float]
    website: Optional[str]
    category_id: int
    has_opening_hours: bool
    timestamp: str
    geom: Geom

class Segment(BaseModel):
    start: Geom
    end: Geom
    poi: List[Poi]

class ORToolsConfig(BaseModel):
    score_weight: int
    distance_penalty: int
    time_limit: int
    balanced_threshold_multiplier: float
    balanced_penalty_strength: float

class SelectPoiRequest(BaseModel):
    axis: Axis
    start_point: Geom
    end_point: Geom
    days: List[Day]
    segments_poi: List[Segment]
    scores: PoiScores
    max_route_length_day: float
    poi_per_day: int
    OSRM_SERVER_URL: str
    PERCENTAGE_OF_CALC_POIS: float
    MAX_NUMBER_OF_CALC_POIS: int
    OR_TOOLS_CONFIG: ORToolsConfig
    CLUSTER_SIZE_KM: float
    EARTH_RADIUS_KM: int
    REDIS_CONFIG: RedisConfig
    job_id: str

