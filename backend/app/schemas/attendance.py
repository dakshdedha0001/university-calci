from pydantic import BaseModel, Field, model_validator


class AttendanceCalculateRequest(BaseModel):
    classes_held: int = Field(ge=0)
    classes_attended: int = Field(ge=0)
    total_semester_classes: int = Field(gt=0)
    target_percent: int = Field(default=75, ge=1, le=100)

    @model_validator(mode="after")
    def validate_counts(self) -> "AttendanceCalculateRequest":
        if self.classes_held > self.total_semester_classes:
            raise ValueError("classes_held cannot exceed total_semester_classes")
        if self.classes_attended > self.classes_held:
            raise ValueError("classes_attended cannot exceed classes_held")
        return self


class AttendanceCalculateResponse(BaseModel):
    held: int
    attended: int
    missed: int
    total_semester: int
    current_percentage: float
    is_safe_current: bool
    remaining: int
    bunkable: int
    must_attend: int
    min_total_needed: int
    final_attended: int
    final_percentage: float
    best_case_pct: float
    worst_case_pct: float
    target: int
    verdict: str


class AttendanceSubjectCreate(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    total_semester_classes: int = Field(gt=0)
    classes_held: int = Field(ge=0)
    classes_attended: int = Field(ge=0)
    target_percent: int = Field(default=75, ge=1, le=100)


class AttendanceSubjectUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=120)
    total_semester_classes: int | None = Field(default=None, gt=0)
    classes_held: int | None = Field(default=None, ge=0)
    classes_attended: int | None = Field(default=None, ge=0)
    target_percent: int | None = Field(default=None, ge=1, le=100)


class AttendanceSubjectResponse(AttendanceSubjectCreate):
    id: str

    model_config = {"from_attributes": True}
