"""Thin wrappers around root attendance_calculator.py — core logic unchanged."""

from app.domain.legacy_path import PROJECT_ROOT  # noqa: F401 — ensures path

from attendance_calculator import (  # type: ignore[import-untyped]
    calculate_bunk_budget,
    calculate_current_attendance,
)

__all__ = ["calculate_bunk_budget", "calculate_current_attendance", "run_attendance_report"]


def run_attendance_report(
    held: int,
    attended: int,
    total_semester: int,
    target: int = 75,
) -> dict:
    current_pct = calculate_current_attendance(attended, held)
    budget = calculate_bunk_budget(attended, held, total_semester, target=target)
    return {
        "held": held,
        "attended": attended,
        "missed": held - attended,
        "total_semester": total_semester,
        "current_percentage": round(current_pct, 2),
        "is_safe_current": current_pct >= target,
        **budget,
        "final_percentage": round(budget["final_percentage"], 2),
        "best_case_pct": round(budget["best_case_pct"], 2),
        "worst_case_pct": round(budget["worst_case_pct"], 2),
    }
