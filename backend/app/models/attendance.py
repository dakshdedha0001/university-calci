import uuid

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.models.base import Base, TimestampMixin, new_uuid


class AttendanceSubject(Base, TimestampMixin):
    __tablename__ = "attendance_subjects"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=new_uuid)
    user_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        index=True,
        nullable=False,
    )
    name: Mapped[str] = mapped_column(String(120), nullable=False)
    total_semester_classes: Mapped[int] = mapped_column(Integer, nullable=False)
    classes_held: Mapped[int] = mapped_column(Integer, nullable=False)
    classes_attended: Mapped[int] = mapped_column(Integer, nullable=False)
    target_percent: Mapped[int] = mapped_column(Integer, default=75, nullable=False)

    user: Mapped["User"] = relationship(back_populates="attendance_subjects")
