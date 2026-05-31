from pydantic import BaseModel, Field, field_validator

from app.models.subject import VALID_GRADES


class SubjectInput(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    code: str = Field(min_length=1, max_length=32)
    credits: int = Field(ge=1, le=6)
    grade: str

    @field_validator("grade")
    @classmethod
    def validate_grade(cls, value: str) -> str:
        if value not in VALID_GRADES:
            raise ValueError(f"grade must be one of: {', '.join(VALID_GRADES)}")
        return value


class SemesterInput(BaseModel):
    number: int = Field(ge=1, le=12)
    subjects: list[SubjectInput] = Field(min_length=1)


class SgpaCalculateRequest(BaseModel):
    subjects: list[SubjectInput] = Field(min_length=1)


class SgpaCalculateResponse(BaseModel):
    sgpa: float
    total_credits: int
    subjects: list[dict]


class CgpaCalculateResponse(BaseModel):
    cgpa: float
    standing: str
    equivalent_percent: float
    semesters: list[dict]


class ImprovementScenario(BaseModel):
    subject: str
    code: str
    credits: int
    sem_name: str
    old_grade: str
    new_grade: str
    cgpa_gain: float
    impact_score: float


class TargetCgpaRequest(BaseModel):
    target_cgpa: float = Field(ge=0, le=10)


class FuturePredictRequest(BaseModel):
    future_sgpas: list[float] = Field(min_length=1)

    @field_validator("future_sgpas")
    @classmethod
    def validate_sgpas(cls, values: list[float]) -> list[float]:
        for sgpa in values:
            if sgpa < 0 or sgpa > 10:
                raise ValueError("each future SGPA must be between 0 and 10")
        return values
