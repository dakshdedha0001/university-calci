from fastapi import APIRouter

from app.core.dependencies import CurrentUser, DbSession
from app.schemas.profile import ProfileResponse, ProfileUpdate
from app.services.student_service import get_or_create_profile

router = APIRouter(prefix="/profile", tags=["profile"])


@router.get("", response_model=ProfileResponse)
def get_profile(current_user: CurrentUser, db: DbSession) -> ProfileResponse:
    profile = get_or_create_profile(db, current_user)
    return ProfileResponse(
        full_name=current_user.full_name,
        roll_number=profile.roll_number,
        course_name=profile.course_name,
        total_semesters=profile.total_semesters,
        target_cgpa=profile.target_cgpa,
    )


@router.patch("", response_model=ProfileResponse)
def update_profile(
    body: ProfileUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> ProfileResponse:
    profile = get_or_create_profile(db, current_user)
    if body.full_name is not None:
        current_user.full_name = body.full_name.strip()
    if body.roll_number is not None:
        profile.roll_number = body.roll_number.strip() or None
    if body.course_name is not None:
        profile.course_name = body.course_name.strip() or None
    if body.total_semesters is not None:
        profile.total_semesters = body.total_semesters
    if body.target_cgpa is not None:
        profile.target_cgpa = body.target_cgpa
    db.commit()
    db.refresh(current_user)
    db.refresh(profile)
    return ProfileResponse(
        full_name=current_user.full_name,
        roll_number=profile.roll_number,
        course_name=profile.course_name,
        total_semesters=profile.total_semesters,
        target_cgpa=profile.target_cgpa,
    )
