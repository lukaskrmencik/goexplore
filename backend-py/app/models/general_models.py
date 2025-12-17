from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class Geom(BaseModel):
    type: str
    coordinates: List[float]

class Axis(BaseModel):
    type: str
    coordinates: List[List[float]]

class Day(BaseModel):
    startDatetime: datetime
    endDatetime: datetime
    dayLength: float
    timePercentOfFull: float

class ScoreWeight(BaseModel):
    weight: float
    min: Optional[float] = None
    max: Optional[float] = None

class RedisConfig(BaseModel):
    host: str
    password: Optional[str] = None
    port: int
    job_expires: int