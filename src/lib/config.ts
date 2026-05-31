export function getApiUrl(): string {
  const url = import.meta.env.VITE_API_URL;
  if (!url) {
    if (import.meta.env.DEV) {
      return "http://localhost:8000";
    }
    throw new Error("VITE_API_URL is not configured");
  }
  return url.replace(/\/$/, "");
}
