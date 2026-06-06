from fastapi import APIRouter

from .event_types.views import router as event_types_router

router = APIRouter(
    prefix='/public',
    tags=['Public'],
)

router.include_router(event_types_router)
