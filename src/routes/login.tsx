import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, type FormEvent } from "react";
import { Check } from "lucide-react";
import { loginUser, registerUser } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/client";
import { setTokens } from "@/lib/auth-storage";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign In — University Calci" }] }),
  component: LoginPage,
});

function LoginPage() {
  return <AuthLayout mode="login" />;
}

export function AuthLayout({ mode }: { mode: "login" | "register" }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);

  const isRegister = mode === "register";

  const authMutation = useMutation({
    mutationFn: async () => {
      if (isRegister) {
        return registerUser({ email, password, full_name: name });
      }
      return loginUser({ email, password });
    },
    onSuccess: (tokens) => {
      setTokens(tokens.access_token, tokens.refresh_token);
      queryClient.clear();
      navigate({ to: "/app/dashboard" });
    },
    onError: (err: Error) => {
      setError(err instanceof ApiError ? err.message : "Authentication failed");
    },
  });

  const onSubmit = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (isRegister && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (!email.trim() || !password) {
      setError("Email and password are required.");
      return;
    }
    authMutation.mutate();
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <aside className="hidden flex-col justify-between bg-primary p-12 text-primary-foreground lg:flex">
        <Link to="/" className="font-serif text-2xl">
          University <span className="italic">Calci</span>
        </Link>
        <div className="max-w-md">
          <h2 className="font-serif text-5xl leading-tight">
            Track smarter.
            <br />
            <span className="italic opacity-90">Score higher.</span>
          </h2>
          <ul className="mt-10 space-y-4 text-sm">
            {[
              "Track your attendance with surgical precision",
              "Calculate SGPA & CGPA in one click",
              "Plan the grades you need to reach your goals",
            ].map((t) => (
              <li key={t} className="flex items-start gap-3">
                <span className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-white/15">
                  <Check className="h-3 w-3" />
                </span>
                {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs opacity-70">© {new Date().getFullYear()} University Calci</p>
      </aside>

      <main className="flex items-center justify-center bg-background px-6 py-16">
        <div className="w-full max-w-sm">
          <h1 className="font-serif text-4xl text-foreground">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            {isRegister
              ? "Start tracking your academic performance in seconds."
              : "Sign in to continue to your dashboard."}
          </p>

          <form onSubmit={onSubmit} className="mt-8 space-y-4">
            {error && (
              <p className="rounded-lg bg-[#FEE2E2] px-3 py-2 text-sm text-[#991B1B]" role="alert">
                {error}
              </p>
            )}
            {isRegister && (
              <Field
                label="Full name"
                type="text"
                value={name}
                onChange={setName}
                placeholder="Alex Carter"
              />
            )}
            <Field
              label="Email"
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@university.edu"
            />
            <Field
              label="Password"
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
            />
            <button
              type="submit"
              disabled={authMutation.isPending}
              className="mt-2 w-full rounded-lg bg-primary px-4 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 disabled:opacity-60"
            >
              {authMutation.isPending
                ? "Please wait…"
                : isRegister
                  ? "Create account"
                  : "Sign in"}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            {isRegister ? "Already have an account?" : "New here?"}{" "}
            <Link
              to={isRegister ? "/login" : "/register"}
              className="font-medium text-primary hover:underline"
            >
              {isRegister ? "Sign in" : "Create an account"}
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}

function Field({
  label,
  type,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full rounded-lg border border-border bg-surface px-3.5 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
