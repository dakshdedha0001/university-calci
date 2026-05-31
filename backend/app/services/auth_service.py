from sqlalchemy import select
from sqlalchemy.orm import Session

from app.core.security import create_access_token, create_refresh_token, hash_password, verify_password
from app.models import StudentProfile, User


class AuthError(Exception):
    pass


def register_user(
    db: Session,
    *,
    email: str,
    password: str,
    full_name: str,
) -> User:
    existing = db.scalar(select(User).where(User.email == email.lower()))
    if existing:
        raise AuthError("Email already registered")

    user = User(
        email=email.lower().strip(),
        hashed_password=hash_password(password),
        full_name=full_name.strip(),
    )
    db.add(user)
    db.flush()
    db.add(StudentProfile(user_id=user.id))
    db.commit()
    db.refresh(user)
    return user


def authenticate_user(db: Session, *, email: str, password: str) -> User:
    user = db.scalar(select(User).where(User.email == email.lower().strip()))
    if user is None or not verify_password(password, user.hashed_password):
        raise AuthError("Invalid email or password")
    return user


def issue_tokens(user: User) -> dict[str, str]:
    subject = str(user.id)
    return {
        "access_token": create_access_token(subject),
        "refresh_token": create_refresh_token(subject),
        "token_type": "bearer",
    }
