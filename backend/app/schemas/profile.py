from pydantic import BaseModel, Field


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=1, max_length=120)
    roll_number: str | None = Field(default=None, max_length=60)
    course_name: str | None = Field(default=None, max_length=120)
    total_semesters: int | None = Field(default=None, ge=1, le=12)
    target_cgpa: float | None = Field(default=None, ge=0, le=10)


class ProfileResponse(BaseModel):
    full_name: str
    roll_number: str | None
    course_name: str | None
    total_semesters: int
    target_cgpa: float
