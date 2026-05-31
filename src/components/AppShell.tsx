import { Link, Outlet, useLocation } from "@tanstack/react-router";
import {
  LayoutDashboard,
  CalendarCheck,
  Calculator,
  LineChart,
  Target,
  Settings,
  Bell,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { fetchProfile } from "@/lib/api/profile";
import { queryKeys } from "@/lib/query-keys";

const nav = [
  { to: "/app/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/app/attendance", label: "Attendance", icon: CalendarCheck },
  { to: "/app/sgpa", label: "SGPA Calculator", icon: Calculator },
  { to: "/app/cgpa", label: "CGPA", icon: LineChart },
  { to: "/app/improvement", label: "Improvement", icon: Target },
  { to: "/app/settings", label: "Settings", icon: Settings },
] as const;

const titles: Record<string, string> = {
  "/app/dashboard": "Dashboard",
  "/app/attendance": "Attendance Tracker",
  "/app/sgpa": "SGPA Calculator",
  "/app/cgpa": "CGPA Dashboard",
  "/app/improvement": "Improvement Analyzer",
  "/app/settings": "Settings",
};

export function AppShell() {
  const { data: profile } = useQuery({
    queryKey: queryKeys.profile,
    queryFn: fetchProfile,
  });
  const displayName = profile?.full_name ?? "Student";
  const loc = useLocation();
  const title = titles[loc.pathname] || "Dashboard";
  const initials = displayName
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-[240px] flex-col border-r border-border bg-surface lg:flex">
        <div className="px-6 py-5">
          <Link to="/" className="inline-flex items-baseline gap-1">
            <span className="font-serif text-xl text-foreground">University</span>
            <span className="font-serif text-xl italic text-primary">Calci</span>
          </Link>
        </div>
        <nav className="flex-1 px-3 py-2">
          {nav.map((item) => {
            const active = loc.pathname === item.to;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`mb-0.5 flex items-center gap-3 rounded-lg border-l-2 px-3 py-2 text-sm transition-colors ${
                  active
                    ? "border-primary bg-primary-soft text-primary font-medium"
                    : "border-transparent text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>
        <div className="m-3 flex items-center gap-3 rounded-lg border border-border bg-background p-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
            {initials || "S"}
          </div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium text-foreground">{displayName}</div>
            <div className="truncate text-xs text-muted-foreground">Student</div>
          </div>
        </div>
      </aside>

      <div className="lg:pl-[240px]">
        <header className="sticky top-0 z-20 flex h-16 items-center justify-between border-b border-border bg-surface px-6">
          <h1 className="font-serif text-2xl text-foreground">{title}</h1>
          <div className="flex items-center gap-3">
            <button className="rounded-lg p-2 text-muted-foreground hover:bg-muted hover:text-foreground">
              <Bell className="h-4 w-4" />
            </button>
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-primary-foreground">
              {initials || "S"}
            </div>
          </div>
        </header>
        <main className="px-6 py-8 lg:px-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
