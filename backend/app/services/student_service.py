from sqlalchemy import select
from sqlalchemy.orm import Session, selectinload

from app.domain.academic import subject_from_grade
from app.models import Semester, StudentProfile, Subject, User


def get_or_create_profile(db: Session, user: User) -> StudentProfile:
    if user.profile:
        return user.profile
    profile = StudentProfile(user_id=user.id)
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def load_student_for_user(db: Session, user: User) -> dict:
    profile = get_or_create_profile(db, user)
    semesters = db.scalars(
        select(Semester)
        .where(Semester.user_id == user.id)
        .options(selectinload(Semester.subjects))
        .order_by(Semester.number)
    ).all()

    sem_dicts = []
    for sem in semesters:
        subjects = [
            subject_from_grade(s.name, s.code, s.credits, s.grade) for s in sem.subjects
        ]
        total_credits = sum(s["credits"] for s in subjects)
        total_weighted = sum(s["weighted"] for s in subjects)
        sgpa = round(total_weighted / total_credits, 4) if total_credits else 0.0
        sem_dicts.append(
            {
                "number": sem.number,
                "name": sem.name,
                "subjects": subjects,
                "total_credits": total_credits,
                "total_weighted": total_weighted,
                "sgpa": sgpa,
            }
        )

    return {
        "name": user.full_name,
        "roll": profile.roll_number or "",
        "course": profile.course_name or "",
        "total_sem": profile.total_semesters,
        "semesters": sem_dicts,
        "target_cgpa": profile.target_cgpa,
    }


def upsert_semester(
    db: Session,
    user: User,
    *,
    number: int,
    subjects: list[dict],
) -> Semester:
    sem = db.scalar(
        select(Semester).where(Semester.user_id == user.id, Semester.number == number)
    )
    if sem is None:
        sem = Semester(user_id=user.id, number=number, name=f"Semester {number}")
        db.add(sem)
        db.flush()
    else:
        for sub in list(sem.subjects):
            db.delete(sub)

    for item in subjects:
        db.add(
            Subject(
                semester_id=sem.id,
                name=item["name"],
                code=item["code"].upper(),
                credits=item["credits"],
                grade=item["grade"],
            )
        )

    db.commit()
    db.refresh(sem)
    return sem
