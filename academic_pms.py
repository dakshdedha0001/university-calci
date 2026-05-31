"""
╔══════════════════════════════════════════════════════════════════╗
║        ACADEMIC PERFORMANCE MANAGEMENT SYSTEM  v1.0             ║
║        Professional Grade Academic Analytics Engine             ║
╚══════════════════════════════════════════════════════════════════╝
"""

import math
import os
import sys
from datetime import datetime

# ══════════════════════════════════════════════════════════════════
# GLOBAL CONSTANTS
# ══════════════════════════════════════════════════════════════════

GRADE_POINTS = {
    "O":  10,
    "A+":  9,
    "A":   8,
    "B+":  7,
    "B":   6,
    "C":   5,
    "P":   4,
}

GRADE_ORDER = ["O", "A+", "A", "B+", "B", "C", "P"]  # best → worst

# Academic standing thresholds
STANDING = [
    (9.0,  "OUTSTANDING 🏆"),
    (8.0,  "EXCELLENT ⭐"),
    (7.0,  "VERY GOOD ✅"),
    (6.0,  "GOOD 👍"),
    (5.0,  "AVERAGE ⚠️"),
    (0.0,  "NEEDS IMPROVEMENT ❌"),
]

# Terminal width for formatting
W = 70


# ══════════════════════════════════════════════════════════════════
# DISPLAY UTILITIES
# ══════════════════════════════════════════════════════════════════

def clear():
    """Clear the terminal screen."""
    os.system("cls" if os.name == "nt" else "clear")


def line(char="═", width=W):
    print(char * width)


def section(title):
    """Print a styled section header."""
    print()
    line("═")
    print(f"  ◈  {title.upper()}")
    line("─")


def banner():
    """Print the application banner."""
    clear()
    line("═")
    print("  ╔" + "═" * 64 + "╗")
    print("  ║{:^64}║".format("ACADEMIC PERFORMANCE MANAGEMENT SYSTEM"))
    print("  ║{:^64}║".format("Professional Grade Analytics Engine  v1.0"))
    print("  ╚" + "═" * 64 + "╝")
    line("═")
    print()


def table_row(cols, widths, sep="│"):
    """Print a formatted table row."""
    parts = []
    for val, w in zip(cols, widths):
        parts.append(f" {str(val):<{w}} ")
    print(sep + sep.join(parts) + sep)


def table_header(cols, widths):
    """Print table header with borders."""
    top = "┌" + "┬".join("─" * (w + 2) for w in widths) + "┐"
    mid = "├" + "┼".join("─" * (w + 2) for w in widths) + "┤"
    bot = "└" + "┴".join("─" * (w + 2) for w in widths) + "┘"
    print(top)
    table_row(cols, widths, "│")
    print(mid)
    return bot


def info(label, value, indent=2):
    """Print a key-value info line."""
    print(f"{' ' * indent}{label:<30}: {value}")


def success(msg):  print(f"\n  ✅  {msg}")
def warn(msg):     print(f"\n  ⚠️   {msg}")
def error(msg):    print(f"\n  ❌  {msg}")
def tip(msg):      print(f"  💡  {msg}")


# ══════════════════════════════════════════════════════════════════
# VALIDATION UTILITIES
# ══════════════════════════════════════════════════════════════════

def get_int(prompt, min_val=0, max_val=9999):
    """Get a validated integer from user."""
    while True:
        try:
            val = int(input(prompt).strip())
            if val < min_val or val > max_val:
                error(f"Enter a value between {min_val} and {max_val}.")
            else:
                return val
        except ValueError:
            error("Please enter a valid whole number.")


def get_float(prompt, min_val=0.0, max_val=10.0):
    """Get a validated float from user."""
    while True:
        try:
            val = float(input(prompt).strip())
            if val < min_val or val > max_val:
                error(f"Enter a value between {min_val} and {max_val}.")
            else:
                return val
        except ValueError:
            error("Please enter a valid number.")


def get_grade(prompt):
    """Get a validated grade from user."""
    valid = list(GRADE_POINTS.keys())
    while True:
        g = input(prompt).strip().upper()
        if g in valid:
            return g
        error(f"Invalid grade. Valid grades: {', '.join(valid)}")


def get_nonempty(prompt, max_len=60):
    """Get a non-empty stripped string."""
    while True:
        val = input(prompt).strip()
        if not val:
            error("This field cannot be empty.")
        elif len(val) > max_len:
            error(f"Too long. Max {max_len} characters.")
        else:
            return val


# ══════════════════════════════════════════════════════════════════
# STUDENT PROFILE
# ══════════════════════════════════════════════════════════════════

def create_student():
    """Collect and return student profile data."""
    section("NEW STUDENT PROFILE")
    name       = get_nonempty("  Student Name       : ")
    roll       = get_nonempty("  Roll Number        : ")
    course     = get_nonempty("  Course Name        : ")
    total_sem  = get_int("  Total Semesters    : ", 1, 12)
    return {
        "name":       name,
        "roll":       roll,
        "course":     course,
        "total_sem":  total_sem,
        "semesters":  [],          # list of semester dicts
    }


# ══════════════════════════════════════════════════════════════════
# SEMESTER & SGPA
# ══════════════════════════════════════════════════════════════════

def enter_semester(student):
    """Collect one semester's subject data and compute SGPA."""
    section("ADD SEMESTER DATA")

    # Prevent duplicates
    existing_nums = [s["number"] for s in student["semesters"]]
    sem_num = get_int("  Semester Number    : ", 1, student["total_sem"])
    if sem_num in existing_nums:
        warn(f"Semester {sem_num} already exists. Edit not supported yet.")
        return

    sem_name = f"Semester {sem_num}"
    n_subjects = get_int("  Number of Subjects : ", 1, 20)

    subjects = []
    used_codes = set()

    for i in range(n_subjects):
        print(f"\n  ── Subject {i+1} ──")
        sub_name = get_nonempty("    Subject Name  : ")
        # Unique code check
        while True:
            code = get_nonempty("    Subject Code  : ").upper()
            if code in used_codes:
                warn("Duplicate code. Enter a unique subject code.")
            else:
                used_codes.add(code)
                break
        credits  = get_int("    Credits       : ", 1, 6)
        grade    = get_grade("    Grade (O/A+/A/B+/B/C/P) : ")
        gp       = GRADE_POINTS[grade]
        weighted = credits * gp
        subjects.append({
            "name":     sub_name,
            "code":     code,
            "credits":  credits,
            "grade":    grade,
            "gp":       gp,
            "weighted": weighted,
        })

    total_credits  = sum(s["credits"]  for s in subjects)
    total_weighted = sum(s["weighted"] for s in subjects)
    sgpa = round(total_weighted / total_credits, 4) if total_credits else 0

    semester = {
        "number":         sem_num,
        "name":           sem_name,
        "subjects":       subjects,
        "total_credits":  total_credits,
        "total_weighted": total_weighted,
        "sgpa":           sgpa,
    }
    student["semesters"].append(semester)
    student["semesters"].sort(key=lambda s: s["number"])

    print()
    success(f"Semester {sem_num} added!  SGPA = {sgpa:.4f}")
    display_sgpa_table(semester)


def display_sgpa_table(semester):
    """Print a formatted subject table for one semester."""
    section(f"{semester['name']} — SGPA Detail")

    cols   = ["Subject", "Code", "Cr", "Grade", "GP", "Wtd"]
    widths = [22, 8, 4, 6, 4, 6]
    bottom = table_header(cols, widths)

    for s in semester["subjects"]:
        table_row(
            [s["name"][:22], s["code"], s["credits"], s["grade"], s["gp"], s["weighted"]],
            widths
        )
    print(bottom)

    info("Total Credits",  semester["total_credits"])
    info("Total Weighted", semester["total_weighted"])
    info("SGPA",           f"{semester['sgpa']:.4f}")
    info("Standing",       get_standing(semester["sgpa"]))

    # Best / Worst
    best  = max(semester["subjects"], key=lambda s: s["gp"])
    worst = min(semester["subjects"], key=lambda s: s["gp"])
    weak_heavy = max(semester["subjects"], key=lambda s: (s["credits"] if s["gp"] < 7 else 0))

    print()
    tip(f"Best Subject   : {best['name']} ({best['grade']})")
    tip(f"Worst Subject  : {worst['name']} ({worst['grade']})")
    if weak_heavy["gp"] < 7:
        tip(f"Credit-Heavy Weak : {weak_heavy['name']} — {weak_heavy['credits']} credits, Grade {weak_heavy['grade']}")


# ══════════════════════════════════════════════════════════════════
# CGPA
# ══════════════════════════════════════════════════════════════════

def compute_cgpa(student):
    """Return CGPA as average of all semester SGPAs."""
    sems = student["semesters"]
    if not sems:
        return 0.0
    return round(sum(s["sgpa"] for s in sems) / len(sems), 4)


def get_standing(gpa):
    """Return academic standing label for a GPA value."""
    for threshold, label in STANDING:
        if gpa >= threshold:
            return label
    return "NEEDS IMPROVEMENT ❌"


def display_cgpa(student):
    """Print full CGPA report with trend analysis."""
    sems = student["semesters"]
    if not sems:
        warn("No semester data available.")
        return

    section("CGPA REPORT")
    cgpa = compute_cgpa(student)

    info("Student",  student["name"])
    info("Roll No",  student["roll"])
    info("Course",   student["course"])
    info("CGPA",     f"{cgpa:.4f}")
    info("Standing", get_standing(cgpa))
    info("Equiv %",  f"{cgpa * 10:.2f}%")

    print()
    line("─")
    print(f"  {'Sem':<6} {'SGPA':<10} {'Standing':<25} {'Trend'}")
    line("─")

    prev = None
    sgpa_list = []
    for s in sems:
        trend = ""
        if prev is not None:
            diff = s["sgpa"] - prev
            trend = f"▲ +{diff:.4f}" if diff > 0 else (f"▼ {diff:.4f}" if diff < 0 else "── 0.0000")
        print(f"  {s['name']:<6} {s['sgpa']:<10.4f} {get_standing(s['sgpa']):<25} {trend}")
        prev = s["sgpa"]
        sgpa_list.append(s["sgpa"])

    line("─")
    best_sem  = max(sems, key=lambda s: s["sgpa"])
    worst_sem = min(sems, key=lambda s: s["sgpa"])
    print()
    tip(f"Best Semester  : {best_sem['name']} — SGPA {best_sem['sgpa']:.4f}")
    tip(f"Worst Semester : {worst_sem['name']} — SGPA {worst_sem['sgpa']:.4f}")
    tip(f"Average SGPA   : {sum(sgpa_list)/len(sgpa_list):.4f}")

    # Trend message
    if len(sgpa_list) >= 2:
        overall = sgpa_list[-1] - sgpa_list[0]
        if overall > 0:
            success(f"Overall trend: IMPROVING  (+{overall:.4f})")
        elif overall < 0:
            warn(f"Overall trend: DECLINING  ({overall:.4f})")
        else:
            print("\n  📊  Overall trend: STABLE")


# ══════════════════════════════════════════════════════════════════
# IMPROVEMENT ANALYZER (Feature 4 + 5)
# ══════════════════════════════════════════════════════════════════

def improvement_scenarios_for_subject(student, sem_idx, sub_idx):
    """
    For one subject, generate every possible grade upgrade scenario.
    Returns a list of scenario dicts.
    """
    sems      = student["semesters"]
    sem       = sems[sem_idx]
    sub       = sem["subjects"][sub_idx]
    current_g = sub["grade"]
    current_gp = GRADE_POINTS[current_g]

    # Only grades strictly better than current
    upgrades = [g for g in GRADE_ORDER if GRADE_POINTS[g] > current_gp]
    if not upgrades:
        return []  # Already at O

    current_cgpa = compute_cgpa(student)
    n_sems       = len(sems)

    scenarios = []
    for new_grade in upgrades:
        new_gp = GRADE_POINTS[new_grade]
        # Recalculate this semester's SGPA with the improved grade
        new_weighted  = sem["total_weighted"] - sub["weighted"] + sub["credits"] * new_gp
        new_sgpa      = round(new_weighted / sem["total_credits"], 4)
        sgpa_gain     = round(new_sgpa - sem["sgpa"], 4)
        # CGPA impact: replace old SGPA with new SGPA
        new_cgpa      = round((current_cgpa * n_sems - sem["sgpa"] + new_sgpa) / n_sems, 4)
        cgpa_gain     = round(new_cgpa - current_cgpa, 4)
        pct_improvement = round((cgpa_gain / current_cgpa) * 100, 2) if current_cgpa else 0
        # Impact score: weight by credits and CGPA gain
        impact_score  = round(sub["credits"] * cgpa_gain * 100, 3)

        scenarios.append({
            "subject":      sub["name"],
            "code":         sub["code"],
            "credits":      sub["credits"],
            "sem_name":     sem["name"],
            "old_grade":    current_g,
            "old_gp":       current_gp,
            "new_grade":    new_grade,
            "new_gp":       new_gp,
            "old_sgpa":     sem["sgpa"],
            "new_sgpa":     new_sgpa,
            "sgpa_gain":    sgpa_gain,
            "old_cgpa":     current_cgpa,
            "new_cgpa":     new_cgpa,
            "cgpa_gain":    cgpa_gain,
            "pct_improve":  pct_improvement,
            "impact_score": impact_score,
        })
    return scenarios


def impact_level(score):
    if score >= 1.0:  return "CRITICAL 🔴"
    if score >= 0.5:  return "HIGH 🟠"
    if score >= 0.2:  return "MEDIUM 🟡"
    return "LOW 🟢"


def analyze_improvements(student):
    """Generate improvement scenarios for every subject in every semester."""
    if not student["semesters"]:
        warn("No semester data. Add semesters first.")
        return

    section("AI-LIKE IMPROVEMENT ANALYZER")

    all_scenarios = []

    for si, sem in enumerate(student["semesters"]):
        for sj, sub in enumerate(sem["subjects"]):
            scenarios = improvement_scenarios_for_subject(student, si, sj)
            all_scenarios.extend(scenarios)

    if not all_scenarios:
        success("All subjects are already at the highest grade (O)! 🏆")
        return

    # Sort by impact_score descending
    all_scenarios.sort(key=lambda x: x["impact_score"], reverse=True)

    print(f"\n  Total improvement opportunities found: {len(all_scenarios)}")
    print()

    # ── Top 3 highest impact improvements ──
    print("  🏆  TOP HIGH-IMPACT IMPROVEMENTS\n")
    for rank, sc in enumerate(all_scenarios[:5], 1):
        line("─")
        print(f"  Rank #{rank}  —  {sc['subject']}  [{sc['sem_name']}]")
        line("─")
        info("Subject Code",     sc["code"],                 4)
        info("Credits",          sc["credits"],              4)
        info("Grade Change",     f"{sc['old_grade']} ({sc['old_gp']}) → {sc['new_grade']} ({sc['new_gp']})", 4)
        info("SGPA Change",      f"{sc['old_sgpa']:.4f} → {sc['new_sgpa']:.4f}  (gain: +{sc['sgpa_gain']:.4f})", 4)
        info("CGPA Change",      f"{sc['old_cgpa']:.4f} → {sc['new_cgpa']:.4f}  (gain: +{sc['cgpa_gain']:.4f})", 4)
        info("% Improvement",    f"{sc['pct_improve']}%", 4)
        info("Impact Level",     impact_level(sc["impact_score"]), 4)
        print()

    # ── Full subject-by-subject drill down ──
    choice = input("  View ALL scenarios in detail? (y/n): ").strip().lower()
    if choice != "y":
        return

    # Group by subject for clean display
    seen_subs = {}
    for sc in all_scenarios:
        key = (sc["sem_name"], sc["code"])
        seen_subs.setdefault(key, []).append(sc)

    for (sem_n, code), group in seen_subs.items():
        section(f"{sem_n}  ▸  {group[0]['subject']} [{code}]  ({group[0]['credits']} credits)")
        info("Current Grade", f"{group[0]['old_grade']}  (GP: {group[0]['old_gp']})")
        info("Current CGPA",  f"{group[0]['old_cgpa']:.4f}")
        print()
        cols   = ["New Grade", "New SGPA", "SGPA Gain", "New CGPA", "CGPA Gain", "Impact"]
        widths = [10, 10, 10, 10, 10, 15]
        bottom = table_header(cols, widths)
        for sc in group:
            table_row([
                f"{sc['new_grade']} ({sc['new_gp']})",
                f"{sc['new_sgpa']:.4f}",
                f"+{sc['sgpa_gain']:.4f}",
                f"{sc['new_cgpa']:.4f}",
                f"+{sc['cgpa_gain']:.4f}",
                impact_level(sc["impact_score"]),
            ], widths)
        print(bottom)


# ══════════════════════════════════════════════════════════════════
# TARGET CGPA PLANNER (Feature 6)
# ══════════════════════════════════════════════════════════════════

def target_cgpa_planner(student):
    """Guide user toward a target CGPA by suggesting subject improvements."""
    if not student["semesters"]:
        warn("No semester data available.")
        return

    section("TARGET CGPA PLANNER")
    current_cgpa = compute_cgpa(student)
    n_sems       = len(student["semesters"])

    info("Current CGPA", f"{current_cgpa:.4f}")
    target = get_float("  Enter your Target CGPA (0–10): ", 0.0, 10.0)

    gap = round(target - current_cgpa, 4)
    if gap <= 0:
        success(f"You already meet or exceed the target CGPA of {target}! 🎉")
        return

    print(f"\n  CGPA Gap to bridge : +{gap:.4f}")

    # Gather all improvement scenarios, sort by impact
    all_scenarios = []
    for si, sem in enumerate(student["semesters"]):
        for sj in range(len(sem["subjects"])):
            for sc in improvement_scenarios_for_subject(student, si, sj):
                all_scenarios.append(sc)

    # Greedy approach: apply best non-overlapping improvements until target met
    # Track which (sem, subject_code, grade) slots are already "improved"
    applied = {}  # code → new_grade
    simulated_sgpas = {s["name"]: s["sgpa"] for s in student["semesters"]}
    running_cgpa = current_cgpa

    roadmap = []
    # Sort by cgpa_gain desc, then pick unique (sem+sub) with strictly increasing grade
    all_scenarios.sort(key=lambda x: (-x["cgpa_gain"], -x["credits"]))

    for sc in all_scenarios:
        key = (sc["sem_name"], sc["code"])
        if key in applied and GRADE_POINTS[applied[key]] >= sc["new_gp"]:
            continue  # already applied a better or equal upgrade

        # Check this improvement builds on the last applied state
        base_gp = GRADE_POINTS[applied.get(key, sc["old_grade"])]
        if sc["new_gp"] <= base_gp:
            continue

        # Apply this improvement temporarily
        old_sim_sgpa = simulated_sgpas[sc["sem_name"]]
        # Reconstruct: take the semester and swap grade
        sem_obj = next(s for s in student["semesters"] if s["name"] == sc["sem_name"])
        sub_obj = next(s for s in sem_obj["subjects"] if s["code"] == sc["code"])
        current_grade_in_sim = applied.get(key, sub_obj["grade"])
        old_credits_weighted  = sub_obj["credits"] * GRADE_POINTS[current_grade_in_sim]
        new_credits_weighted  = sub_obj["credits"] * sc["new_gp"]
        new_sim_sgpa = round(
            (old_sim_sgpa * sem_obj["total_credits"] - old_credits_weighted + new_credits_weighted)
            / sem_obj["total_credits"], 4
        )
        new_running_cgpa = round(
            (running_cgpa * n_sems - old_sim_sgpa + new_sim_sgpa) / n_sems, 4
        )
        cgpa_gain = round(new_running_cgpa - running_cgpa, 4)

        roadmap.append({
            "step":       len(roadmap) + 1,
            "sem":        sc["sem_name"],
            "subject":    sc["subject"],
            "code":       sc["code"],
            "credits":    sc["credits"],
            "from_grade": current_grade_in_sim,
            "to_grade":   sc["new_grade"],
            "new_sgpa":   new_sim_sgpa,
            "new_cgpa":   new_running_cgpa,
            "cgpa_gain":  cgpa_gain,
        })

        applied[key] = sc["new_grade"]
        simulated_sgpas[sc["sem_name"]] = new_sim_sgpa
        running_cgpa = new_running_cgpa

        if running_cgpa >= target:
            break

    # Display roadmap
    print()
    line("═")
    print(f"  🗺️   ROADMAP TO CGPA {target}")
    line("═")

    if running_cgpa < target:
        warn(f"Target CGPA {target} is NOT fully achievable by improving existing grades.")
        print(f"  Best achievable CGPA with all improvements: {running_cgpa:.4f}")
    else:
        success(f"Target CGPA {target} is ACHIEVABLE! Follow this roadmap:")

    print()
    for step in roadmap:
        print(f"  Step {step['step']}: [{step['sem']}]  {step['subject']} ({step['code']})")
        print(f"    Grade : {step['from_grade']} → {step['to_grade']}   (Credits: {step['credits']})")
        print(f"    CGPA  : +{step['cgpa_gain']:.4f}  →  New CGPA = {step['new_cgpa']:.4f}")
        print()

    info("Starting CGPA",   f"{current_cgpa:.4f}")
    info("Target CGPA",     f"{target:.4f}")
    info("Achievable CGPA", f"{running_cgpa:.4f}")
    info("Total Steps",     len(roadmap))


# ══════════════════════════════════════════════════════════════════
# FUTURE PERFORMANCE PREDICTOR (Feature 7)
# ══════════════════════════════════════════════════════════════════

def future_predictor(student):
    """Simulate future semesters and predict graduation CGPA."""
    section("FUTURE PERFORMANCE PREDICTOR")

    total_sems     = student["total_sem"]
    completed_sems = len(student["semesters"])
    remaining_sems = total_sems - completed_sems

    if remaining_sems <= 0:
        warn("All semesters are already completed. No future semesters to predict.")
        return

    current_cgpa = compute_cgpa(student)
    info("Completed Semesters", completed_sems)
    info("Remaining Semesters", remaining_sems)
    info("Current CGPA",        f"{current_cgpa:.4f}")
    print()

    print("  Enter expected SGPA for each remaining semester:\n")
    future_sgpas = []
    for i in range(1, remaining_sems + 1):
        sgpa = get_float(f"    Semester {completed_sems + i} expected SGPA : ", 0.0, 10.0)
        future_sgpas.append(sgpa)

    # Calculate graduation CGPA
    all_sgpas     = [s["sgpa"] for s in student["semesters"]] + future_sgpas
    final_cgpa    = round(sum(all_sgpas) / len(all_sgpas), 4)
    cgpa_change   = round(final_cgpa - current_cgpa, 4)

    section("PREDICTION RESULTS")
    info("Current CGPA",        f"{current_cgpa:.4f}")
    info("Predicted Final CGPA",f"{final_cgpa:.4f}")
    change_str = f"+{cgpa_change:.4f}" if cgpa_change >= 0 else f"{cgpa_change:.4f}"
    info("CGPA Change",          change_str)
    info("Predicted Standing",   get_standing(final_cgpa))
    info("Predicted Equiv %",    f"{final_cgpa * 10:.2f}%")

    # Required SGPA to achieve various targets
    print()
    line("─")
    print("  📌  REQUIRED SGPA IN REMAINING SEMESTERS TO HIT TARGETS:\n")
    for target in [7.0, 7.5, 8.0, 8.5, 9.0]:
        # final_cgpa = (sum_existing + x * remaining) / total
        # x = (final * total - sum_existing) / remaining
        sum_existing = sum(s["sgpa"] for s in student["semesters"])
        needed_each  = (target * total_sems - sum_existing) / remaining_sems
        if needed_each > 10:
            print(f"    Target {target:.1f}  →  Not achievable (would need >{needed_each:.2f} SGPA/sem)")
        elif needed_each < 0:
            print(f"    Target {target:.1f}  →  Already achieved ✅")
        else:
            print(f"    Target {target:.1f}  →  Need {needed_each:.4f} SGPA per remaining semester")

    # Smart warnings
    print()
    line("─")
    print("  ⚠️   SMART WARNINGS\n")
    if final_cgpa < 7.0:
        warn("Predicted graduation CGPA is below 7.0 — may impact placements.")
    if final_cgpa < current_cgpa:
        warn("Predicted CGPA is LOWER than current — performance declining!")
    if any(g < 6.0 for g in future_sgpas):
        warn("One or more expected future semesters have SGPA below 6.0.")
    avg_future = sum(future_sgpas) / len(future_sgpas)
    if avg_future < current_cgpa:
        warn("Average expected future performance is below current CGPA level.")


# ══════════════════════════════════════════════════════════════════
# PERFORMANCE ANALYTICS (Feature 9)
# ══════════════════════════════════════════════════════════════════

def performance_analytics(student):
    """Show grade distribution, credit breakdown, and academic trends."""
    if not student["semesters"]:
        warn("No data available.")
        return

    section("PERFORMANCE ANALYTICS")

    # Aggregate all subjects
    all_subjects = []
    for sem in student["semesters"]:
        for sub in sem["subjects"]:
            all_subjects.append({**sub, "sem": sem["name"]})

    total_subjects = len(all_subjects)
    total_credits  = sum(s["credits"] for s in all_subjects)

    # Grade distribution
    grade_dist = {g: 0 for g in GRADE_ORDER}
    for s in all_subjects:
        grade_dist[s["grade"]] += 1

    print("\n  📊  GRADE DISTRIBUTION\n")
    line("─")
    for g, count in grade_dist.items():
        if count == 0:
            continue
        bar = "█" * count + "░" * (total_subjects - count)
        print(f"  {g:<4} : {bar}  {count}")
    line("─")

    # Credit distribution
    print("\n  📦  CREDIT DISTRIBUTION\n")
    credit_dist = {}
    for s in all_subjects:
        credit_dist[s["credits"]] = credit_dist.get(s["credits"], 0) + 1
    for cr, cnt in sorted(credit_dist.items()):
        print(f"  {cr}-credit subjects : {cnt}  ({cnt * cr} total credits)")

    # Strong vs Weak
    strong = [s for s in all_subjects if s["gp"] >= 8]
    weak   = [s for s in all_subjects if s["gp"] <= 5]
    avg_gp = sum(s["gp"] for s in all_subjects) / total_subjects

    print(f"\n  ✅  STRONG SUBJECTS  (Grade ≥ A)  — {len(strong)} subjects\n")
    for s in strong:
        print(f"    {s['name']:<25} [{s['sem']}]  Grade: {s['grade']}  Credits: {s['credits']}")

    print(f"\n  ❌  WEAK SUBJECTS  (Grade ≤ C)  — {len(weak)} subjects\n")
    for s in weak:
        print(f"    {s['name']:<25} [{s['sem']}]  Grade: {s['grade']}  Credits: {s['credits']}")

    print()
    info("Total Subjects",   total_subjects)
    info("Total Credits",    total_credits)
    info("Avg Grade Points", f"{avg_gp:.2f}")
    info("CGPA",             f"{compute_cgpa(student):.4f}")

    # ASCII CGPA trend sparkline
    sgpas = [s["sgpa"] for s in student["semesters"]]
    if len(sgpas) > 1:
        print(f"\n  📈  SGPA TREND\n")
        _max = max(sgpas)
        _min = min(sgpas)
        bars = ["▁","▂","▃","▄","▅","▆","▇","█"]
        sparkline = ""
        for v in sgpas:
            idx = int((v - _min) / (_max - _min + 0.0001) * 7)
            sparkline += bars[idx] + " "
        print(f"    {sparkline}")
        print(f"    Low: {_min:.2f}  →  High: {_max:.2f}")


# ══════════════════════════════════════════════════════════════════
# SMART WARNING ENGINE (Feature 8)
# ══════════════════════════════════════════════════════════════════

def smart_warnings(student):
    """Print targeted performance warnings."""
    if not student["semesters"]:
        return

    section("SMART WARNING SYSTEM")
    cgpa = compute_cgpa(student)
    warnings = []

    # CGPA threshold warnings
    for threshold in [9.0, 8.0, 7.0, 6.0]:
        if cgpa < threshold:
            warnings.append(f"Your CGPA ({cgpa:.2f}) is below {threshold:.1f}.")
            break

    # Declining trend
    sgpas = [s["sgpa"] for s in student["semesters"]]
    if len(sgpas) >= 2 and sgpas[-1] < sgpas[-2]:
        warnings.append(f"CGPA trend is DECLINING — latest semester SGPA dropped by {sgpas[-2]-sgpas[-1]:.2f}.")

    # Identify single most damaging subject
    worst_impact = None
    for si, sem in enumerate(student["semesters"]):
        for sj, sub in enumerate(sem["subjects"]):
            if sub["gp"] < 7 and sub["credits"] >= 4:
                impact_key = sub["credits"] * (7 - sub["gp"])
                if worst_impact is None or impact_key > worst_impact[2]:
                    worst_impact = (sub, sem["name"], impact_key)

    if worst_impact:
        sub, sem_n, _ = worst_impact
        warnings.append(
            f"Subject '{sub['name']}' ({sem_n}, {sub['credits']} credits, Grade {sub['grade']}) "
            f"is heavily impacting your SGPA."
        )
        if sub["credits"] >= 4:
            warnings.append(
                f"Improving '{sub['name']}' from {sub['grade']} to A could significantly boost your CGPA."
            )

    # Check if any semester SGPA < 6
    for s in student["semesters"]:
        if s["sgpa"] < 6:
            warnings.append(f"{s['name']} SGPA ({s['sgpa']:.2f}) is critically low — below 6.0.")

    if not warnings:
        success("No critical warnings. Keep up the great work! 🌟")
    else:
        for w in warnings:
            warn(w)


# ══════════════════════════════════════════════════════════════════
# FULL STUDENT REPORT (Feature 14)
# ══════════════════════════════════════════════════════════════════

def full_report(student):
    """Generate a complete academic report."""
    if not student["semesters"]:
        warn("No data to report.")
        return

    section("COMPLETE ACADEMIC REPORT")
    cgpa = compute_cgpa(student)
    timestamp = datetime.now().strftime("%d %b %Y, %I:%M %p")

    line("═")
    print(f"  Report Generated : {timestamp}")
    line("─")
    info("Student Name", student["name"])
    info("Roll Number",  student["roll"])
    info("Course",       student["course"])
    info("Total Sems",   student["total_sem"])
    info("Completed",    len(student["semesters"]))
    info("CGPA",         f"{cgpa:.4f}")
    info("Equiv %",      f"{cgpa * 10:.2f}%")
    info("Standing",     get_standing(cgpa))
    line("═")

    for sem in student["semesters"]:
        print(f"\n  ▸  {sem['name']}  —  SGPA: {sem['sgpa']:.4f}")
        line("─")
        for sub in sem["subjects"]:
            print(f"    {sub['name']:<28} {sub['code']:<10} Cr:{sub['credits']}  {sub['grade']:<4} GP:{sub['gp']}")
        print(f"    {'TOTAL CREDITS':<28} {'':10} {sem['total_credits']}")

    # Summary stats
    all_subs = [s for sem in student["semesters"] for s in sem["subjects"]]
    best_sub  = max(all_subs, key=lambda s: s["gp"])
    worst_sub = min(all_subs, key=lambda s: s["gp"])
    best_sem  = max(student["semesters"], key=lambda s: s["sgpa"])
    worst_sem = min(student["semesters"], key=lambda s: s["sgpa"])

    print()
    line("─")
    print("  SUMMARY HIGHLIGHTS\n")
    tip(f"Best Semester  : {best_sem['name']}  SGPA {best_sem['sgpa']:.4f}")
    tip(f"Worst Semester : {worst_sem['name']}  SGPA {worst_sem['sgpa']:.4f}")
    tip(f"Best Subject   : {best_sub['name']} ({best_sub['grade']})")
    tip(f"Worst Subject  : {worst_sub['name']} ({worst_sub['grade']})")

    # Top improvement opportunity
    all_scenarios = []
    for si, sem in enumerate(student["semesters"]):
        for sj in range(len(sem["subjects"])):
            all_scenarios.extend(improvement_scenarios_for_subject(student, si, sj))
    if all_scenarios:
        best_sc = max(all_scenarios, key=lambda x: x["impact_score"])
        print()
        tip(f"Top Improvement: Improve {best_sc['subject']} [{best_sc['sem_name']}] "
            f"from {best_sc['old_grade']} to {best_sc['new_grade']} "
            f"→ CGPA +{best_sc['cgpa_gain']:.4f}")

    smart_warnings(student)
    line("═")


# ══════════════════════════════════════════════════════════════════
# MAIN MENU
# ══════════════════════════════════════════════════════════════════

MENU = """
  ╔══════════════════════════════════╗
  ║          MAIN MENU               ║
  ╠══════════════════════════════════╣
  ║  1.  Add Semester Data           ║
  ║  2.  View Semester SGPA          ║
  ║  3.  View CGPA Report            ║
  ║  4.  Improvement Analyzer        ║
  ║  5.  Target CGPA Planner         ║
  ║  6.  Future CGPA Predictor       ║
  ║  7.  Performance Analytics       ║
  ║  8.  Smart Warning System        ║
  ║  9.  Full Academic Report        ║
  ║  0.  Exit                        ║
  ╚══════════════════════════════════╝
"""


def view_semester_sgpa(student):
    """Let user pick a semester to view detailed SGPA."""
    if not student["semesters"]:
        warn("No semester data available.")
        return
    section("SELECT SEMESTER")
    for i, s in enumerate(student["semesters"], 1):
        print(f"  {i}. {s['name']}  — SGPA: {s['sgpa']:.4f}")
    choice = get_int(f"\n  Select semester (1-{len(student['semesters'])}): ", 1, len(student["semesters"]))
    display_sgpa_table(student["semesters"][choice - 1])


def main():
    banner()
    print("  Welcome to the Academic Performance Management System.")
    print("  Let's start by setting up your student profile.\n")

    student = create_student()

    while True:
        banner()
        info("Active Student", f"{student['name']}  |  CGPA: {compute_cgpa(student):.4f}  |  {len(student['semesters'])}/{student['total_sem']} semesters", 2)
        print(MENU)
        choice = input("  ▶  Enter your choice: ").strip()

        if choice == "1":
            enter_semester(student)
        elif choice == "2":
            view_semester_sgpa(student)
        elif choice == "3":
            display_cgpa(student)
        elif choice == "4":
            analyze_improvements(student)
        elif choice == "5":
            target_cgpa_planner(student)
        elif choice == "6":
            future_predictor(student)
        elif choice == "7":
            performance_analytics(student)
        elif choice == "8":
            smart_warnings(student)
        elif choice == "9":
            full_report(student)
        elif choice == "0":
            print("\n  👋  Thank you for using APMS. Study hard, bunk wisely! 🎓\n")
            sys.exit(0)
        else:
            error("Invalid choice. Enter a number from 0–9.")

        input("\n  Press Enter to return to main menu...")


# ══════════════════════════════════════════════════════════════════
# ENTRY POINT
# ══════════════════════════════════════════════════════════════════

if __name__ == "__main__":
    main()
