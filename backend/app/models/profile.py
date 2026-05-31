import uuid

from sqlalchemy import Float, ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class StudentProfile(Base, TimestampMixin):
    __tablename__ = "student_profiles"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        unique=True,
        nullable=False,
    )
    roll_number: Mapped[str | None] = mapped_column(String(60), nullable=True)
    course_name: Mapped[str | None] = mapped_column(String(120), nullable=True)
    total_semesters: Mapped[int] = mapped_column(Integer, default=8, nullable=False)
    target_cgpa: Mapped[float] = mapped_column(Float, nullable=False, default=9.0)

    user: Mapped["User"] = relationship(back_populates="profile")
