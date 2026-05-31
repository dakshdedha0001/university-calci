import { apiFetch } from "@/lib/api/client";
import type { AttendanceCalculateResponse, AttendanceSubjectResponse } from "@/lib/api/types";

export function calculateAttendance(body: {
  classes_held: number;
  classes_attended: number;
  total_semester_classes: number;
  target_percent?: number;
}) {
  return apiFetch<AttendanceCalculateResponse>("/api/v1/attendance/calculate", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function fetchAttendanceSubjects() {
  return apiFetch<AttendanceSubjectResponse[]>("/api/v1/attendance/subjects");
}

export function createAttendanceSubject(body: {
  name: string;
  total_semester_classes: number;
  classes_held: number;
  classes_attended: number;
  target_percent?: number;
}) {
  return apiFetch<AttendanceSubjectResponse>("/api/v1/attendance/subjects", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function updateAttendanceSubject(
  id: string,
  body: Partial<{
    name: string;
    total_semester_classes: number;
    classes_held: number;
    classes_attended: number;
  }>,
) {
  return apiFetch<AttendanceSubjectResponse>(`/api/v1/attendance/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function deleteAttendanceSubject(id: string) {
  return apiFetch<void>(`/api/v1/attendance/subjects/${id}`, { method: "DELETE" });
}
