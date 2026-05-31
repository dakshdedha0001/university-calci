from fastapi import APIRouter

from app.api.v1 import academic, attendance, auth, profile

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(profile.router)
api_router.include_router(attendance.router)
api_router.include_router(academic.router)
