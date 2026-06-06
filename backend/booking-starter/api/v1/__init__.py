from fastapi import APIRouter

from .admin import router as admin_router
from .public import router as public_router

router = APIRouter(
    prefix='/v1',
)
router.include_router(admin_router)
router.include_router(public_router)
