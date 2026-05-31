export type ProfileResponse = {
  full_name: string;
  roll_number: string | null;
  course_name: string | null;
  total_semesters: number;
  target_cgpa: number;
};

export type SemesterSubject = {
  id: string;
  name: string;
  code: string;
  credits: number;
  grade: string;
};

export type SemesterResponse = {
  id: string;
  number: number;
  name: string;
  sgpa: number;
  subjects: SemesterSubject[];
};

export type CgpaResponse = {
  cgpa: number;
  standing: string;
  equivalent_percent: number;
  semesters: { number: number; name: string; sgpa: number; standing: string }[];
};

export type AttendanceCalculateResponse = {
  current_percentage: number;
  bunkable: number;
  must_attend: number;
  best_case_pct: number;
  worst_case_pct: number;
  remaining: number;
  verdict: string;
  is_safe_current: boolean;
};

export type AttendanceSubjectResponse = {
  id: string;
  name: string;
  total_semester_classes: number;
  classes_held: number;
  classes_attended: number;
  target_percent: number;
};

export type ImprovementScenario = {
  subject: string;
  code: string;
  credits: number;
  sem_name: string;
  old_grade: string;
  new_grade: string;
  cgpa_gain: number;
  impact_score: number;
};
