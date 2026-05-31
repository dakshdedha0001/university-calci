from fastapi import APIRouter, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import selectinload

from app.core.dependencies import CurrentUser, DbSession
from app.models import Semester
from app.domain.academic import (
    compute_cgpa,
    compute_semester_sgpa,
    get_standing,
    list_improvement_scenarios,
    plan_target_cgpa,
    predict_future_cgpa,
    subject_from_grade,
)
from app.schemas.academic import (
    CgpaCalculateResponse,
    FuturePredictRequest,
    SemesterInput,
    SgpaCalculateRequest,
    SgpaCalculateResponse,
    TargetCgpaRequest,
)
from app.services.student_service import load_student_for_user, upsert_semester

router = APIRouter(prefix="/academic", tags=["academic"])


@router.get("/semesters")
def list_semesters(current_user: CurrentUser, db: DbSession) -> list[dict]:
    semesters = db.scalars(
        select(Semester)
        .where(Semester.user_id == current_user.id)
        .options(selectinload(Semester.subjects))
        .order_by(Semester.number)
    ).all()
    result = []
    for sem in semesters:
        subjects = [
            subject_from_grade(s.name, s.code, s.credits, s.grade) for s in sem.subjects
        ]
        result.append(
            {
                "id": str(sem.id),
                "number": sem.number,
                "name": sem.name,
                "sgpa": compute_semester_sgpa(subjects),
                "subjects": [
                    {
                        "id": str(s.id),
                        "name": s.name,
                        "code": s.code,
                        "credits": s.credits,
                        "grade": s.grade,
                    }
                    for s in sem.subjects
                ],
            }
        )
    return result


@router.delete("/semesters/{semester_number}", status_code=status.HTTP_204_NO_CONTENT)
def delete_semester(
    semester_number: int,
    current_user: CurrentUser,
    db: DbSession,
) -> None:
    sem = db.scalar(
        select(Semester).where(
            Semester.user_id == current_user.id,
            Semester.number == semester_number,
        )
    )
    if sem is None:
        raise HTTPException(status_code=404, detail="Semester not found")
    db.delete(sem)
    db.commit()


@router.post("/sgpa/calculate", response_model=SgpaCalculateResponse)
def calculate_sgpa(body: SgpaCalculateRequest) -> SgpaCalculateResponse:
    subjects = [
        subject_from_grade(s.name, s.code, s.credits, s.grade) for s in body.subjects
    ]
    sgpa = compute_semester_sgpa(subjects)
    return SgpaCalculateResponse(
        sgpa=sgpa,
        total_credits=sum(s["credits"] for s in subjects),
        subjects=subjects,
    )


@router.get("/cgpa", response_model=CgpaCalculateResponse)
def get_cgpa(current_user: CurrentUser, db: DbSession) -> CgpaCalculateResponse:
    student = load_student_for_user(db, current_user)
    if not student["semesters"]:
        return CgpaCalculateResponse(
            cgpa=0,
            standing=get_standing(0),
            equivalent_percent=0,
            semesters=[],
        )
    cgpa = compute_cgpa(student)
    return CgpaCalculateResponse(
        cgpa=cgpa,
        standing=get_standing(cgpa),
        equivalent_percent=round(cgpa * 10, 2),
        semesters=[
            {
                "number": s["number"],
                "name": s["name"],
                "sgpa": s["sgpa"],
                "standing": get_standing(s["sgpa"]),
            }
            for s in student["semesters"]
        ],
    )


@router.post("/semesters", status_code=status.HTTP_201_CREATED)
def save_semester(
    body: SemesterInput,
    current_user: CurrentUser,
    db: DbSession,
) -> dict:
    subjects = [
        {"name": s.name, "code": s.code, "credits": s.credits, "grade": s.grade}
        for s in body.subjects
    ]
    sem = upsert_semester(db, current_user, number=body.number, subjects=subjects)
    shaped = [subject_from_grade(s.name, s.code, s.credits, s.grade) for s in sem.subjects]
    return {"id": str(sem.id), "number": sem.number, "sgpa": compute_semester_sgpa(shaped)}


@router.get("/improvements")
def improvements(current_user: CurrentUser, db: DbSession) -> dict:
    student = load_student_for_user(db, current_user)
    scenarios = list_improvement_scenarios(student)
    return {"count": len(scenarios), "top": scenarios[:10]}


@router.post("/target-cgpa")
def target_planner(body: TargetCgpaRequest, current_user: CurrentUser, db: DbSession) -> dict:
    student = load_student_for_user(db, current_user)
    if not student["semesters"]:
        raise HTTPException(status_code=400, detail="Add semester data first")
    return plan_target_cgpa(student, body.target_cgpa)


@router.post("/predict")
def predict(body: FuturePredictRequest, current_user: CurrentUser, db: DbSession) -> dict:
    student = load_student_for_user(db, current_user)
    return predict_future_cgpa(student, body.future_sgpas)
