"""Thin wrappers around root academic_pms.py — core logic unchanged."""

from app.domain.legacy_path import PROJECT_ROOT  # noqa: F401

from academic_pms import (  # type: ignore[import-untyped]
    GRADE_POINTS,
    GRADE_ORDER,
    analyze_improvements,
    compute_cgpa,
    future_predictor,
    get_standing,
    improvement_scenarios_for_subject,
    performance_analytics,
    smart_warnings,
    target_cgpa_planner,
)

__all__ = [
    "GRADE_POINTS",
    "GRADE_ORDER",
    "analyze_improvements",
    "build_student_dict",
    "compute_cgpa",
    "compute_semester_sgpa",
    "get_standing",
    "improvement_scenarios_for_subject",
    "list_improvement_scenarios",
    "plan_target_cgpa",
    "predict_future_cgpa",
]


def build_student_dict(
    *,
    name: str,
    roll: str,
    course: str,
    total_sem: int,
    semesters: list[dict],
) -> dict:
    """Shape persisted DB data into the dict format expected by academic_pms."""
    return {
        "name": name,
        "roll": roll,
        "course": course,
        "total_sem": total_sem,
        "semesters": semesters,
    }


def compute_semester_sgpa(subjects: list[dict]) -> float:
    total_credits = sum(s["credits"] for s in subjects)
    if not total_credits:
        return 0.0
    total_weighted = sum(s["credits"] * s["gp"] for s in subjects)
    return round(total_weighted / total_credits, 4)


def subject_from_grade(name: str, code: str, credits: int, grade: str) -> dict:
    gp = GRADE_POINTS[grade]
    return {
        "name": name,
        "code": code.upper(),
        "credits": credits,
        "grade": grade,
        "gp": gp,
        "weighted": credits * gp,
    }


def semester_dict(number: int, subjects: list[dict]) -> dict:
    total_credits = sum(s["credits"] for s in subjects)
    total_weighted = sum(s["weighted"] for s in subjects)
    sgpa = round(total_weighted / total_credits, 4) if total_credits else 0.0
    return {
        "number": number,
        "name": f"Semester {number}",
        "subjects": subjects,
        "total_credits": total_credits,
        "total_weighted": total_weighted,
        "sgpa": sgpa,
    }


def list_improvement_scenarios(student: dict) -> list[dict]:
    all_scenarios: list[dict] = []
    for si, sem in enumerate(student["semesters"]):
        for sj in range(len(sem["subjects"])):
            all_scenarios.extend(improvement_scenarios_for_subject(student, si, sj))
    all_scenarios.sort(key=lambda x: x["impact_score"], reverse=True)
    return all_scenarios


def plan_target_cgpa(student: dict, target: float) -> dict:
    """Run greedy planner logic without CLI I/O (mirrors target_cgpa_planner)."""
    current_cgpa = compute_cgpa(student)
    gap = round(target - current_cgpa, 4)
    if gap <= 0:
        return {
            "current_cgpa": current_cgpa,
            "target_cgpa": target,
            "achievable": True,
            "roadmap": [],
            "final_cgpa": current_cgpa,
        }

    n_sems = len(student["semesters"])
    all_scenarios: list[dict] = []
    for si, sem in enumerate(student["semesters"]):
        for sj in range(len(sem["subjects"])):
            all_scenarios.extend(improvement_scenarios_for_subject(student, si, sj))

    applied: dict = {}
    simulated_sgpas = {s["name"]: s["sgpa"] for s in student["semesters"]}
    running_cgpa = current_cgpa
    roadmap: list[dict] = []
    all_scenarios.sort(key=lambda x: (-x["cgpa_gain"], -x["credits"]))

    for sc in all_scenarios:
        key = (sc["sem_name"], sc["code"])
        if key in applied and GRADE_POINTS[applied[key]] >= sc["new_gp"]:
            continue
        base_gp = GRADE_POINTS[applied.get(key, sc["old_grade"])]
        if sc["new_gp"] <= base_gp:
            continue

        sem_obj = next(s for s in student["semesters"] if s["name"] == sc["sem_name"])
        sub_obj = next(s for s in sem_obj["subjects"] if s["code"] == sc["code"])
        current_grade_in_sim = applied.get(key, sub_obj["grade"])
        old_credits_weighted = sub_obj["credits"] * GRADE_POINTS[current_grade_in_sim]
        new_credits_weighted = sub_obj["credits"] * sc["new_gp"]
        old_sim_sgpa = simulated_sgpas[sc["sem_name"]]
        new_sim_sgpa = round(
            (old_sim_sgpa * sem_obj["total_credits"] - old_credits_weighted + new_credits_weighted)
            / sem_obj["total_credits"],
            4,
        )
        new_running_cgpa = round(
            (running_cgpa * n_sems - old_sim_sgpa + new_sim_sgpa) / n_sems,
            4,
        )
        cgpa_gain = round(new_running_cgpa - running_cgpa, 4)
        roadmap.append(
            {
                "step": len(roadmap) + 1,
                "semester": sc["sem_name"],
                "subject": sc["subject"],
                "code": sc["code"],
                "credits": sc["credits"],
                "from_grade": current_grade_in_sim,
                "to_grade": sc["new_grade"],
                "new_sgpa": new_sim_sgpa,
                "new_cgpa": new_running_cgpa,
                "cgpa_gain": cgpa_gain,
            }
        )
        applied[key] = sc["new_grade"]
        simulated_sgpas[sc["sem_name"]] = new_sim_sgpa
        running_cgpa = new_running_cgpa
        if running_cgpa >= target:
            break

    return {
        "current_cgpa": current_cgpa,
        "target_cgpa": target,
        "achievable": running_cgpa >= target,
        "final_cgpa": running_cgpa,
        "roadmap": roadmap,
    }


def predict_future_cgpa(student: dict, future_sgpas: list[float]) -> dict:
    completed = student["semesters"]
    total_sems = student["total_sem"]
    current_cgpa = compute_cgpa(student)
    all_sgpas = [s["sgpa"] for s in completed] + future_sgpas
    final_cgpa = round(sum(all_sgpas) / len(all_sgpas), 4) if all_sgpas else 0.0
    remaining = total_sems - len(completed)
    targets: list[dict] = []
    sum_existing = sum(s["sgpa"] for s in completed)
    for target in [7.0, 7.5, 8.0, 8.5, 9.0]:
        if remaining <= 0:
            needed_each = None
        else:
            needed_each = (target * total_sems - sum_existing) / remaining
        targets.append({"target": target, "required_sgpa_per_semester": needed_each})
    return {
        "current_cgpa": current_cgpa,
        "predicted_final_cgpa": final_cgpa,
        "cgpa_change": round(final_cgpa - current_cgpa, 4),
        "standing": get_standing(final_cgpa),
        "required_sgpa_by_target": targets,
    }
