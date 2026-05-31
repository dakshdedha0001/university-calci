import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  BarChart,
  Bar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { Calculator, CalendarCheck, Target, ArrowRight } from "lucide-react";
import { QueryState } from "@/components/QueryState";
import { fetchCgpa } from "@/lib/api/academic";
import { fetchAttendanceSubjects } from "@/lib/api/attendance";
import { fetchProfile } from "@/lib/api/profile";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/app/dashboard")({
  component: DashboardHome,
});

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function DashboardHome() {
  const profileQ = useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });
  const cgpaQ = useQuery({ queryKey: queryKeys.cgpa, queryFn: fetchCgpa });
  const attendanceQ = useQuery({
    queryKey: queryKeys.attendanceSubjects,
    queryFn: fetchAttendanceSubjects,
  });

  const loading = profileQ.isLoading || cgpaQ.isLoading || attendanceQ.isLoading;
  const isError = profileQ.isError || cgpaQ.isError || attendanceQ.isError;
  const error = profileQ.error ?? cgpaQ.error ?? attendanceQ.error;

  return (
    <QueryState
      isLoading={loading}
      isError={isError}
      error={error as Error | null}
      onRetry={() => {
        profileQ.refetch();
        cgpaQ.refetch();
        attendanceQ.refetch();
      }}
    >
      <DashboardContent
        name={profileQ.data?.full_name ?? "Student"}
        targetCgpa={profileQ.data?.target_cgpa ?? 9}
        cgpa={cgpaQ.data}
        attendance={attendanceQ.data ?? []}
      />
    </QueryState>
  );
}

function DashboardContent({
  name,
  targetCgpa,
  cgpa,
  attendance,
}: {
  name: string;
  targetCgpa: number;
  cgpa?: Awaited<ReturnType<typeof fetchCgpa>>;
  attendance: Awaited<ReturnType<typeof fetchAttendanceSubjects>>;
}) {
  const sgpaData =
    cgpa?.semesters.map((s) => ({
      name: `S${s.number}`,
      sgpa: Number(s.sgpa.toFixed(2)),
    })) ?? [];

  const currentCgpa = cgpa?.cgpa ?? 0;
  const bestSgpa = Math.max(0, ...sgpaData.map((d) => d.sgpa));

  const overallAttendance = (() => {
    const held = attendance.reduce((a, b) => a + b.classes_held, 0);
    const att = attendance.reduce((a, b) => a + b.classes_attended, 0);
    return held ? (att / held) * 100 : 0;
  })();

  return (
    <div className="space-y-10">
      <div>
        <h2 className="font-serif text-4xl text-foreground">
          {greeting()}, {name.split(" ")[0]} <span aria-hidden>👋</span>
        </h2>
        <p className="mt-1 text-muted-foreground">Here's a snapshot of your academics today.</p>
      </div>

      <section className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Stat label="Current CGPA" value={currentCgpa.toFixed(2)} />
        <Stat label="Overall Attendance" value={`${overallAttendance.toFixed(1)}%`} />
        <Stat label="Best SGPA" value={bestSgpa.toFixed(2)} />
        <Stat label="Target CGPA" value={targetCgpa.toFixed(2)} />
      </section>

      <section className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Semester Overview</h3>
            <p className="text-sm text-muted-foreground">Your SGPA across each semester.</p>
          </div>
        </div>
        <div className="h-72">
          {sgpaData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
              Add semester data in SGPA Calculator to see your chart.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sgpaData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  cursor={{ fill: "#EEF3FF" }}
                  contentStyle={{
                    border: "1px solid #E5E7EB",
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
                <Bar dataKey="sgpa" fill="#3B6EEA" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">Attendance at a glance</h3>
        {attendance.length === 0 ? (
          <p className="text-sm text-muted-foreground">No attendance subjects yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
            {attendance.map((a) => {
              const pct = a.classes_held
                ? (a.classes_attended / a.classes_held) * 100
                : 0;
              return <RingCard key={a.id} name={a.name} pct={pct} />;
            })}
          </div>
        )}
      </section>

      <section>
        <h3 className="mb-4 text-base font-semibold text-foreground">Quick actions</h3>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <QuickAction to="/app/sgpa" icon={Calculator} title="Calculate SGPA" desc="Add subjects and grades." />
          <QuickAction to="/app/attendance" icon={CalendarCheck} title="Check Attendance" desc="Track every class." />
          <QuickAction to="/app/improvement" icon={Target} title="Improvement Analysis" desc="Plan grades to hit your goals." />
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="text-[11px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-2 font-serif text-5xl text-foreground">{value}</div>
    </div>
  );
}

function RingCard({ name, pct }: { name: string; pct: number }) {
  const color = pct >= 75 ? "#16A34A" : pct >= 65 ? "#D97706" : "#DC2626";
  const r = 30;
  const c = 2 * Math.PI * r;
  const offset = c - (Math.min(100, pct) / 100) * c;
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <svg width="76" height="76" viewBox="0 0 76 76">
        <circle cx="38" cy="38" r={r} fill="none" stroke="#F3F4F6" strokeWidth="6" />
        <circle
          cx="38"
          cy="38"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
          transform="rotate(-90 38 38)"
        />
        <text x="38" y="42" textAnchor="middle" fontSize="14" fill="#111827" fontFamily="DM Sans" fontWeight={600}>
          {pct.toFixed(0)}%
        </text>
      </svg>
      <div className="min-w-0">
        <div className="truncate text-sm font-medium text-foreground">{name}</div>
        <div className="text-xs text-muted-foreground">
          {pct >= 75 ? "Safe" : pct >= 65 ? "At risk" : "Danger"}
        </div>
      </div>
    </div>
  );
}

function QuickAction({
  to,
  icon: Icon,
  title,
  desc,
}: {
  to: string;
  icon: typeof Calculator;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-center justify-between rounded-xl border border-border bg-surface p-5 transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(59,110,234,0.18)]"
    >
      <div className="flex items-center gap-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="text-xs text-muted-foreground">{desc}</div>
        </div>
      </div>
      <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-primary" />
    </Link>
  );
}
