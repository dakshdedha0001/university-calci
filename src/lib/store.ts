// Simple localStorage-backed store for academic data.
import { useEffect, useState } from "react";

export type Grade = "O" | "A+" | "A" | "B+" | "B" | "C" | "P";
export const GRADE_POINTS: Record<Grade, number> = {
  O: 10,
  "A+": 9,
  A: 8,
  "B+": 7,
  B: 6,
  C: 5,
  P: 4,
};
export const GRADE_OPTIONS: Grade[] = ["O", "A+", "A", "B+", "B", "C", "P"];

export type Subject = {
  id: string;
  name: string;
  code?: string;
  credits: number;
  grade: Grade;
};

export type Semester = {
  id: string;
  name: string;
  subjects: Subject[];
};

export type AttendanceSubject = {
  id: string;
  name: string;
  total: number;
  attended: number;
  semesterTotal?: number;
};

export type AppState = {
  user: { name: string };
  semesters: Semester[];
  attendance: AttendanceSubject[];
  targetCGPA: number;
};

const STORAGE_KEY = "uc-app-state-v1";

const defaultState: AppState = {
  user: { name: "Student" },
  semesters: [
    {
      id: "s1",
      name: "Semester 1",
      subjects: [
        { id: "1", name: "Mathematics I", credits: 4, grade: "A" },
        { id: "2", name: "Physics", credits: 3, grade: "A+" },
        { id: "3", name: "Programming", credits: 4, grade: "O" },
        { id: "4", name: "English", credits: 2, grade: "B+" },
      ],
    },
    {
      id: "s2",
      name: "Semester 2",
      subjects: [
        { id: "1", name: "Mathematics II", credits: 4, grade: "A+" },
        { id: "2", name: "Chemistry", credits: 3, grade: "A" },
        { id: "3", name: "Data Structures", credits: 4, grade: "O" },
        { id: "4", name: "Communication", credits: 2, grade: "A" },
      ],
    },
    {
      id: "s3",
      name: "Semester 3",
      subjects: [
        { id: "1", name: "Algorithms", credits: 4, grade: "O" },
        { id: "2", name: "DBMS", credits: 4, grade: "A+" },
        { id: "3", name: "Discrete Math", credits: 3, grade: "A+" },
      ],
    },
  ],
  attendance: [
    { id: "a1", name: "Algorithms", total: 40, attended: 34 },
    { id: "a2", name: "DBMS", total: 38, attended: 30 },
    { id: "a3", name: "Discrete Math", total: 36, attended: 28 },
  ],
  targetCGPA: 9.0,
};

let memory: AppState | null = null;
const listeners = new Set<() => void>();

function load(): AppState {
  if (memory) return memory;
  if (typeof window === "undefined") return defaultState;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    memory = raw ? { ...defaultState, ...JSON.parse(raw) } : defaultState;
  } catch {
    memory = defaultState;
  }
  return memory!;
}

function save(s: AppState) {
  memory = s;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  }
  listeners.forEach((l) => l());
}

export function useAppState(): [AppState, (updater: (s: AppState) => AppState) => void] {
  const [state, setState] = useState<AppState>(() => load());
  useEffect(() => {
    const l = () => setState(load());
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);
  const update = (updater: (s: AppState) => AppState) => save(updater(load()));
  return [state, update];
}

// Calculations
export function calcSGPA(subjects: Subject[]): number {
  const totalCredits = subjects.reduce((a, s) => a + s.credits, 0);
  if (totalCredits === 0) return 0;
  const totalPoints = subjects.reduce((a, s) => a + s.credits * GRADE_POINTS[s.grade], 0);
  return totalPoints / totalCredits;
}

/** Matches backend academic_pms: average of semester SGPAs */
export function calcCGPA(semesters: Semester[]): number {
  const filled = semesters.filter((s) => s.subjects.length > 0);
  if (filled.length === 0) return 0;
  const sgpas = filled.map((s) => calcSGPA(s.subjects));
  return sgpas.reduce((a, b) => a + b, 0) / sgpas.length;
}

export function uid() {
  return Math.random().toString(36).slice(2, 10);
}
