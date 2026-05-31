from typing import Annotated

from fastapi import Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import hash_password
from app.db.session import get_db
from app.models import StudentProfile, User

DbSession = Annotated[Session, Depends(get_db)]

DEFAULT_USER_EMAIL = "guest@university-calci.local"


def get_default_user(db: DbSession) -> User:
    user = db.scalar(select(User).where(User.email == DEFAULT_USER_EMAIL))
    if user is not None:
        return user

    user = User(
        email=DEFAULT_USER_EMAIL,
        hashed_password=hash_password("unused"),
        full_name="Student",
    )
    db.add(user)
    db.flush()
    db.add(StudentProfile(user_id=user.id))
    db.commit()
    db.refresh(user)
    return user


CurrentUser = Annotated[User, Depends(get_default_user)]
