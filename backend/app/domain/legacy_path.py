import sys
from pathlib import Path

# Project root contains attendance_calculator.py and academic_pms.py
PROJECT_ROOT = Path(__file__).resolve().parents[3]
if str(PROJECT_ROOT) not in sys.path:
    sys.path.insert(0, str(PROJECT_ROOT))
