"""
╔══════════════════════════════════════════════════════╗
║         SEMESTER ATTENDANCE CALCULATOR               ║
║         Calculate. Plan. Bunk Wisely. 😄             ║
╚══════════════════════════════════════════════════════╝
"""


# ─────────────────────────────────────────────
# FUNCTION: Display a styled header
# ─────────────────────────────────────────────
def print_header():
    print("\n" + "═" * 54)
    print("       📅  SEMESTER ATTENDANCE CALCULATOR")
    print("═" * 54)


# ─────────────────────────────────────────────
# FUNCTION: Display a section divider
# ─────────────────────────────────────────────
def print_divider():
    print("─" * 54)


# ─────────────────────────────────────────────
# FUNCTION: Get a valid non-negative integer from user
# ─────────────────────────────────────────────
def get_positive_int(prompt):
    while True:
        try:
            value = int(input(prompt))
            if value < 0:
                print("  ⚠️  Value cannot be negative. Try again.")
            else:
                return value
        except ValueError:
            print("  ⚠️  Please enter a valid whole number.")


# ─────────────────────────────────────────────
# FUNCTION: Collect and validate all user inputs
# ─────────────────────────────────────────────
def get_inputs():
    print("\n📥  Enter your attendance details:\n")

    # Total classes in the entire semester
    while True:
        total_semester = get_positive_int("  Total classes in the semester      : ")
        if total_semester == 0:
            print("  ⚠️  Semester total cannot be zero.")
        else:
            break

    # Classes held (conducted) so far
    while True:
        held = get_positive_int("  Classes held till now                : ")
        if held > total_semester:
            print(f"  ⚠️  Classes held ({held}) cannot exceed semester total ({total_semester}).")
        else:
            break

    # Classes attended by the student so far
    while True:
        attended = get_positive_int("  Classes attended till now           : ")
        if attended > held:
            print(f"  ⚠️  Attended ({attended}) cannot exceed classes held ({held}).")
        else:
            break

    return held, attended, total_semester


# ─────────────────────────────────────────────
# FUNCTION: Calculate current attendance %
# ─────────────────────────────────────────────
def calculate_current_attendance(attended, held):
    if held == 0:
        return 0.0
    return (attended / held) * 100


# ─────────────────────────────────────────────
# FUNCTION: Core logic — bunk budget or classes needed
#
# Goal: By semester end, (attended_final / total_semester) >= 0.75
#
# Let remaining = total_semester - held
# If student attends 'x' more classes out of remaining:
#   Final attendance = (attended + x) / total_semester
#
# For 75%: attended + x >= 0.75 * total_semester
#   → x >= (0.75 * total_semester) - attended
#   → min_x = ceil(0.75 * total_semester - attended)
#
# Bunkable = remaining - min_x  (if positive, they can bunk)
# Must attend = min_x           (if bunkable is negative)
# ─────────────────────────────────────────────
def calculate_bunk_budget(attended, held, total_semester, target=75):
    import math

    remaining = total_semester - held          # classes yet to happen
    target_fraction = target / 100

    # Minimum total classes to attend across full semester
    min_total_needed = math.ceil(target_fraction * total_semester)

    # How many MORE classes must be attended from remaining
    additional_needed = min_total_needed - attended

    if additional_needed <= 0:
        # Already safe — even attending 0 more hits target
        bunkable = remaining  # can bunk all remaining
        must_attend = 0
    else:
        must_attend = additional_needed
        bunkable = remaining - must_attend

    # Final attendance if student attends exactly the minimum
    final_attended = attended + must_attend
    final_percentage = (final_attended / total_semester) * 100 if total_semester > 0 else 0

    # Best case: attends every remaining class
    best_case_attended = attended + remaining
    best_case_pct = (best_case_attended / total_semester) * 100

    # Worst case: attends no more classes
    worst_case_pct = (attended / total_semester) * 100

    return {
        "remaining": remaining,
        "bunkable": bunkable,
        "must_attend": must_attend,
        "min_total_needed": min_total_needed,
        "final_attended": final_attended,
        "final_percentage": final_percentage,
        "best_case_pct": best_case_pct,
        "worst_case_pct": worst_case_pct,
        "target": target,
    }


# ─────────────────────────────────────────────
# FUNCTION: Display all results in a clean format
# ─────────────────────────────────────────────
def display_results(held, attended, total_semester, result):
    current_pct = calculate_current_attendance(attended, held)

    print("\n" + "═" * 54)
    print("              📊  ATTENDANCE REPORT")
    print("═" * 54)

    # ── Current Status ──
    print("\n  📌  CURRENT STATUS")
    print_divider()
    print(f"  Classes held so far       : {held}")
    print(f"  Classes attended          : {attended}")
    print(f"  Classes missed            : {held - attended}")
    print(f"  Current Attendance        : {current_pct:.2f}%", end="  ")

    if current_pct >= 75:
        print("✅")
    elif current_pct >= 65:
        print("⚠️  (Below 75%)")
    else:
        print("❌  (Critically Low)")

    # ── Semester Overview ──
    print(f"\n  📅  SEMESTER OVERVIEW")
    print_divider()
    print(f"  Total semester classes    : {total_semester}")
    print(f"  Remaining classes         : {result['remaining']}")
    print(f"  Target attendance         : {result['target']}%  →  min {result['min_total_needed']} classes")

    # ── Projection ──
    print(f"\n  🔮  END-OF-SEMESTER PROJECTIONS")
    print_divider()
    print(f"  Best case  (attend all)   : {result['best_case_pct']:.2f}%")
    print(f"  Worst case (attend none)  : {result['worst_case_pct']:.2f}%")

    # ── Main Verdict ──
    print(f"\n  🎯  VERDICT")
    print_divider()

    if result["bunkable"] > 0:
        print(f"\n  ✅  You can still BUNK  {result['bunkable']}  class(es)")
        print(f"     and still hit {result['target']}% by semester end.")
        print(f"\n  📈  Final attendance (if you bunk exactly {result['bunkable']})")
        print(f"     = {result['final_attended']}/{total_semester} = {result['final_percentage']:.2f}%")

    elif result["bunkable"] == 0:
        print(f"\n  ⚠️  You CANNOT bunk any more classes.")
        print(f"     Attend ALL remaining {result['remaining']} class(es) to hit {result['target']}%.")
        print(f"\n  📈  Final attendance (if you attend all remaining)")
        print(f"     = {result['final_attended']}/{total_semester} = {result['final_percentage']:.2f}%")

    else:
        # bunkable is negative — attendance is too low
        shortfall = abs(result["bunkable"])
        print(f"\n  ❌  Attendance is too low to reach {result['target']}% by semester end.")
        print(f"     Even attending ALL remaining classes won't be enough.")
        print(f"\n  📉  If you attend all remaining {result['remaining']} class(es):")
        print(f"     = {attended + result['remaining']}/{total_semester} = {result['best_case_pct']:.2f}%")

        if result["remaining"] > 0 and result["must_attend"] <= result["remaining"]:
            # Still achievable
            print(f"\n  📌  You must attend at least {result['must_attend']} more class(es)")
            print(f"     out of the remaining {result['remaining']} to reach {result['target']}%.")

    print("\n" + "═" * 54 + "\n")


# ─────────────────────────────────────────────
# FUNCTION: Ask user if they want to run again
# ─────────────────────────────────────────────
def ask_to_retry():
    while True:
        choice = input("  🔄  Calculate for another subject? (y/n): ").strip().lower()
        if choice in ("y", "yes"):
            return True
        elif choice in ("n", "no"):
            return False
        else:
            print("  ⚠️  Please enter 'y' or 'n'.")


# ─────────────────────────────────────────────
# MAIN PROGRAM
# ─────────────────────────────────────────────
def main():
    print_header()
    print("  Plan your bunks smartly using semester-end targets.")

    while True:
        held, attended, total_semester = get_inputs()
        result = calculate_bunk_budget(attended, held, total_semester)
        display_results(held, attended, total_semester, result)

        if not ask_to_retry():
            print("\n  👋  Good luck with your semester! Bunk wisely. 😄\n")
            break


# Entry point
if __name__ == "__main__":
    main()
