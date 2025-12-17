from fastapi import APIRouter
from app.models.select_camps_models import SelectCampsRequest
from app.models.select_poi_models import SelectPoiRequest
from app.services.camps_selection.main import select_camps_service
from app.services.poi_selection.main import select_poi_service

router = APIRouter()

@router.post("/select-camps")
def select_camps(request: SelectCampsRequest):
    result = select_camps_service(request)
    return result

@router.post("/select-poi")
async def select_poi(request: SelectPoiRequest):
    result = await select_poi_service(request)
    return result