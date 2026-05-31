import { apiFetch } from "@/lib/api/client";
import type { CgpaResponse, ImprovementScenario, SemesterResponse } from "@/lib/api/types";

export function fetchSemesters() {
  return apiFetch<SemesterResponse[]>("/api/v1/academic/semesters");
}

export function saveSemester(body: {
  number: number;
  subjects: { name: string; code: string; credits: number; grade: string }[];
}) {
  return apiFetch<{ id: string; number: number; sgpa: number }>("/api/v1/academic/semesters", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function deleteSemester(number: number) {
  return apiFetch<void>(`/api/v1/academic/semesters/${number}`, { method: "DELETE" });
}

export function fetchCgpa() {
  return apiFetch<CgpaResponse>("/api/v1/academic/cgpa");
}

export function fetchImprovements() {
  return apiFetch<{ count: number; top: ImprovementScenario[] }>("/api/v1/academic/improvements");
}

export function planTargetCgpa(target_cgpa: number) {
  return apiFetch<{
    current_cgpa: number;
    target_cgpa: number;
    achievable: boolean;
    final_cgpa: number;
    roadmap: {
      step: number;
      semester: string;
      subject: string;
      from_grade: string;
      to_grade: string;
      new_cgpa: number;
      cgpa_gain: number;
    }[];
  }>("/api/v1/academic/target-cgpa", {
    method: "POST",
    body: JSON.stringify({ target_cgpa }),
  });
}

export function predictCgpa(future_sgpas: number[]) {
  return apiFetch<{
    current_cgpa: number;
    predicted_final_cgpa: number;
    cgpa_change: number;
    standing: string;
    required_sgpa_by_target: { target: number; required_sgpa_per_semester: number | null }[];
  }>("/api/v1/academic/predict", {
    method: "POST",
    body: JSON.stringify({ future_sgpas }),
  });
}

export function calculateSgpa(subjects: { name: string; code: string; credits: number; grade: string }[]) {
  return apiFetch<{ sgpa: number }>("/api/v1/academic/sgpa/calculate", {
    method: "POST",
    body: JSON.stringify({ subjects }),
  });
}
