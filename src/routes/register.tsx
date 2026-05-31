import { createFileRoute } from "@tanstack/react-router";
import { AuthLayout } from "./login";

export const Route = createFileRoute("/register")({
  head: () => ({ meta: [{ title: "Create account — University Calci" }] }),
  component: () => <AuthLayout mode="register" />,
});
