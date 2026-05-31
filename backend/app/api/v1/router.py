from fastapi import APIRouter

from app.api.v1 import academic, attendance, profile

api_router = APIRouter()
api_router.include_router(profile.router)
api_router.include_router(attendance.router)
api_router.include_router(academic.router)
