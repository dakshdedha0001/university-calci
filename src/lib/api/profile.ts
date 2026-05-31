import { apiFetch } from "@/lib/api/client";
import type { ProfileResponse } from "@/lib/api/types";

export function fetchProfile() {
  return apiFetch<ProfileResponse>("/api/v1/profile");
}

export function updateProfile(body: Partial<ProfileResponse>) {
  return apiFetch<ProfileResponse>("/api/v1/profile", {
    method: "PATCH",
    body: JSON.stringify({
      full_name: body.full_name,
      target_cgpa: body.target_cgpa,
      roll_number: body.roll_number,
      course_name: body.course_name,
      total_semesters: body.total_semesters,
    }),
  });
}
