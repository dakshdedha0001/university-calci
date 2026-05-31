import uuid

from fastapi import APIRouter, HTTPException, status

from app.core.dependencies import CurrentUser, DbSession
from app.domain.attendance import run_attendance_report
from app.models import AttendanceSubject
from app.schemas.attendance import (
    AttendanceCalculateRequest,
    AttendanceCalculateResponse,
    AttendanceSubjectCreate,
    AttendanceSubjectResponse,
    AttendanceSubjectUpdate,
)

router = APIRouter(prefix="/attendance", tags=["attendance"])


def _verdict(result: dict) -> str:
    if result["bunkable"] > 0:
        return f"You can bunk {result['bunkable']} class(es) and still hit {result['target']}%."
    if result["bunkable"] == 0:
        return f"Attend all {result['remaining']} remaining class(es) to hit {result['target']}%."
    return f"Cannot reach {result['target']}% even if you attend all remaining classes."


@router.post("/calculate", response_model=AttendanceCalculateResponse)
def calculate(body: AttendanceCalculateRequest) -> AttendanceCalculateResponse:
    try:
        result = run_attendance_report(
            held=body.classes_held,
            attended=body.classes_attended,
            total_semester=body.total_semester_classes,
            target=body.target_percent,
        )
    except Exception as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
    return AttendanceCalculateResponse(**result, verdict=_verdict(result))


@router.get("/subjects", response_model=list[AttendanceSubjectResponse])
def list_subjects(current_user: CurrentUser, db: DbSession) -> list[AttendanceSubject]:
    return list(current_user.attendance_subjects)


@router.post("/subjects", response_model=AttendanceSubjectResponse, status_code=status.HTTP_201_CREATED)
def create_subject(
    body: AttendanceSubjectCreate,
    current_user: CurrentUser,
    db: DbSession,
) -> AttendanceSubject:
    row = AttendanceSubject(
        user_id=current_user.id,
        name=body.name,
        total_semester_classes=body.total_semester_classes,
        classes_held=body.classes_held,
        classes_attended=body.classes_attended,
        target_percent=body.target_percent,
    )
    db.add(row)
    db.commit()
    db.refresh(row)
    return row


@router.patch("/subjects/{subject_id}", response_model=AttendanceSubjectResponse)
def update_subject(
    subject_id: uuid.UUID,
    body: AttendanceSubjectUpdate,
    current_user: CurrentUser,
    db: DbSession,
) -> AttendanceSubject:
    row = db.get(AttendanceSubject, subject_id)
    if row is None or row.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subject not found")
    if body.name is not None:
        row.name = body.name
    if body.total_semester_classes is not None:
        row.total_semester_classes = body.total_semester_classes
    if body.classes_held is not None:
        row.classes_held = body.classes_held
    if body.classes_attended is not None:
        row.classes_attended = body.classes_attended
    if body.target_percent is not None:
        row.target_percent = body.target_percent
    db.commit()
    db.refresh(row)
    return row


@router.delete("/subjects/{subject_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_subject(
    subject_id: uuid.UUID,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    row = db.get(AttendanceSubject, subject_id)
    if row is None or row.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Subject not found")
    db.delete(row)
    db.commit()
