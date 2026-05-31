import { apiFetch } from "@/lib/api/client";
import type { TokenResponse, UserResponse } from "@/lib/api/types";

export function registerUser(body: {
  email: string;
  password: string;
  full_name: string;
}) {
  return apiFetch<TokenResponse>("/api/v1/auth/register", {
    method: "POST",
    body: JSON.stringify(body),
    auth: false,
  });
}

export function loginUser(body: { email: string; password: string }) {
  return apiFetch<TokenResponse>("/api/v1/auth/login", {
    method: "POST",
    body: JSON.stringify(body),
    auth: false,
  });
}

export function fetchMe() {
  return apiFetch<UserResponse>("/api/v1/auth/me");
}

export function refreshTokens(refresh_token: string) {
  return apiFetch<TokenResponse>("/api/v1/auth/refresh", {
    method: "POST",
    body: JSON.stringify({ refresh_token }),
    auth: false,
  });
}
