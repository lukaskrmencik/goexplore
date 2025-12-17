from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from .general_models import Day, ScoreWeight, Geom, Axis 

class Camp(BaseModel):
    id: int
    url: str
    name: str
    image_url: Optional[str] = None
    lat: float
    lon: float
    operating_time_month_from: Optional[int] = None
    operating_time_day_from: Optional[int] = None
    operating_time_month_to: Optional[int] = None
    operating_time_day_to: Optional[int] = None
    web: Optional[str] = None
    review: Optional[str] = None
    review_count: Optional[int] = None
    price_list_url: Optional[str] = None
    accept_cards: Optional[str] = None
    timestamp: datetime
    geom: Geom

class CampDataScore(BaseModel):
    weight: float
    image: ScoreWeight
    operating_time: ScoreWeight
    web: ScoreWeight
    review: ScoreWeight
    review_count: ScoreWeight

class CampScores(BaseModel):
    data: CampDataScore
    distance: ScoreWeight

class DefaultCampSeason(BaseModel):
    open_month: int
    open_day: int
    close_month: int
    close_day: int

class SelectCampsRequest(BaseModel):
    camps: List[Camp]
    days: List[Day]
    axis: Axis
    scores: CampScores
    DEFAULT_CAMP_SEASON: DefaultCampSeason






