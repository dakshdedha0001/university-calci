import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  LineChart,
  Line,
  ResponsiveContainer,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";
import { TrendingUp } from "lucide-react";
import { QueryState } from "@/components/QueryState";
import { fetchCgpa } from "@/lib/api/academic";
import { fetchProfile } from "@/lib/api/profile";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/app/cgpa")({
  component: CGPAPage,
});

function CGPAPage() {
  const cgpaQ = useQuery({ queryKey: queryKeys.cgpa, queryFn: fetchCgpa });
  const profileQ = useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });

  return (
    <QueryState
      isLoading={cgpaQ.isLoading || profileQ.isLoading}
      isError={cgpaQ.isError || profileQ.isError}
      error={(cgpaQ.error ?? profileQ.error) as Error | null}
      onRetry={() => {
        cgpaQ.refetch();
        profileQ.refetch();
      }}
    >
      {cgpaQ.data && (
        <CgpaContent cgpa={cgpaQ.data} targetCgpa={profileQ.data?.target_cgpa ?? 9} />
      )}
    </QueryState>
  );
}

function CgpaContent({
  cgpa,
  targetCgpa,
}: {
  cgpa: Awaited<ReturnType<typeof fetchCgpa>>;
  targetCgpa: number;
}) {
  const rows = cgpa.semesters.map((s) => ({
    name: s.name,
    sgpa: s.sgpa,
    standing: s.standing,
  }));

  const best = rows.reduce(
    (a, b) => (b.sgpa > a.sgpa ? b : a),
    rows[0] ?? { sgpa: 0, name: "—" },
  );
  const trend =
    rows.length >= 2 && rows[rows.length - 1].sgpa >= rows[rows.length - 2].sgpa
      ? "improving 📈"
      : "needs a push 💪";

  const n = rows.length;
  const sumSgpa = rows.reduce((a, b) => a + b.sgpa, 0);
  const nextNeeded =
    n > 0 ? Math.max(0, Math.min(10, (targetCgpa * (n + 1) - sumSgpa) / 1)) : 0;

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground -mt-2">
        Your cumulative academic performance, across every semester.
      </p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:col-span-1">
          <div className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Current CGPA</div>
          <div className="mt-2 font-serif text-7xl text-foreground">{cgpa.cgpa.toFixed(2)}</div>
          <div className="mt-2 text-sm text-muted-foreground">{cgpa.standing}</div>
          <div className="mt-1 text-xs text-muted-foreground">
            Across {rows.length} semester{rows.length === 1 ? "" : "s"}
          </div>
        </div>
        <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] md:col-span-2">
          <h3 className="text-base font-semibold text-foreground">CGPA Trend</h3>
          <div className="mt-2 h-56">
            {rows.length === 0 ? (
              <p className="flex h-full items-center justify-center text-sm text-muted-foreground">
                No semesters yet.
              </p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={rows.map((r) => ({ ...r, sgpa: Number(r.sgpa.toFixed(2)) }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                  <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis domain={[0, 10]} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ border: "1px solid #E5E7EB", borderRadius: 8, fontSize: 12 }} />
                  <Line
                    type="monotone"
                    dataKey="sgpa"
                    stroke="#3B6EEA"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#3B6EEA" }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <div className="border-b border-border px-6 py-4">
          <h3 className="text-base font-semibold text-foreground">Semester breakdown</h3>
        </div>
        <table className="w-full text-sm">
          <thead className="bg-background text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Semester</th>
              <th className="px-6 py-3 text-left font-medium">SGPA</th>
              <th className="px-6 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const status =
                r.sgpa >= 9
                  ? { label: "Excellent", c: "bg-[#DCFCE7] text-[#166534]" }
                  : r.sgpa >= 7.5
                    ? { label: "Strong", c: "bg-primary-soft text-primary" }
                    : r.sgpa >= 6
                      ? { label: "Steady", c: "bg-[#FEF3C7] text-[#92400E]" }
                      : { label: "Needs work", c: "bg-[#FEE2E2] text-[#991B1B]" };
              return (
                <tr key={r.name} className="border-t border-border">
                  <td className="px-6 py-3 font-medium text-foreground">{r.name}</td>
                  <td className="px-6 py-3 font-serif text-xl text-foreground">{r.sgpa.toFixed(2)}</td>
                  <td className="px-6 py-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${status.c}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
        <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
          <TrendingUp className="h-4 w-4 text-primary" /> Insights
        </h3>
        <ul className="mt-4 space-y-2 text-sm text-foreground">
          {best && rows.length > 0 && (
            <li>
              Your highest semester was <span className="font-medium">{best.name}</span> with an SGPA of{" "}
              <span className="font-medium">{best.sgpa.toFixed(2)}</span>.
            </li>
          )}
          <li>Your GPA trend is currently {trend}.</li>
          {rows.length > 0 && (
            <li>
              You'd need an SGPA of about{" "}
              <span className="font-medium text-primary">{nextNeeded.toFixed(2)}</span> next semester to reach your
              target CGPA of {targetCgpa.toFixed(2)}.
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
