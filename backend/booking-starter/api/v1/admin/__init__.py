from fastapi import APIRouter

from .event_types.views import router as event_types_router

router = APIRouter(
    prefix='/admin',
    tags=['Admin'],
)

router.include_router(event_types_router)
