import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Trash2, Plus } from "lucide-react";
import { QueryState } from "@/components/QueryState";
import {
  calculateAttendance,
  createAttendanceSubject,
  deleteAttendanceSubject,
  fetchAttendanceSubjects,
  updateAttendanceSubject,
} from "@/lib/api/attendance";
import type { AttendanceCalculateResponse, AttendanceSubjectResponse } from "@/lib/api/types";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/app/attendance")({
  component: AttendancePage,
});

function AttendancePage() {
  const [held, setHeld] = useState<number | "">(40);
  const [attended, setAttended] = useState<number | "">(30);
  const [semesterTotal, setSemesterTotal] = useState<number | "">(60);
  const [result, setResult] = useState<AttendanceCalculateResponse | null>(null);

  const calcMutation = useMutation({
    mutationFn: () =>
      calculateAttendance({
        classes_held: Number(held) || 0,
        classes_attended: Number(attended) || 0,
        total_semester_classes: Number(semesterTotal) || 0,
      }),
    onSuccess: setResult,
  });

  const subjectsQ = useQuery({
    queryKey: queryKeys.attendanceSubjects,
    queryFn: fetchAttendanceSubjects,
  });

  const pct = result?.current_percentage ?? 0;
  const status =
    pct >= 75
      ? { label: "Safe", color: "bg-[#DCFCE7] text-[#166534]", num: "#16A34A" }
      : pct >= 65
        ? { label: "At Risk", color: "bg-[#FEF3C7] text-[#92400E]", num: "#D97706" }
        : { label: "Danger", color: "bg-[#FEE2E2] text-[#991B1B]", num: "#DC2626" };

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground -mt-2">Calculate exact attendance and forecast your semester.</p>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title="Quick calculator">
          <div className="grid grid-cols-2 gap-4">
            <NumberField label="Classes held till now" value={held} onChange={setHeld} />
            <NumberField label="Classes attended" value={attended} onChange={setAttended} />
            <NumberField
              label="Total semester classes"
              value={semesterTotal}
              onChange={setSemesterTotal}
            />
          </div>
          {calcMutation.isError && (
            <p className="mt-3 text-sm text-[#991B1B]">{(calcMutation.error as Error).message}</p>
          )}
          <button
            type="button"
            onClick={() => calcMutation.mutate()}
            disabled={calcMutation.isPending}
            className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
          >
            {calcMutation.isPending ? "Calculating…" : "Calculate"}
          </button>
        </Card>

        {result && (
          <Card title="Result">
            <div className="flex items-baseline gap-4">
              <div className="font-serif text-[56px] leading-none" style={{ color: status.num }}>
                {pct.toFixed(1)}%
              </div>
              <span className={`rounded-full px-3 py-1 text-xs font-medium ${status.color}`}>
                {status.label}
              </span>
            </div>
            <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <MiniStat label="Safe bunks remaining" value={String(Math.max(0, result.bunkable))} />
              <MiniStat label="Must attend (of remaining)" value={String(result.must_attend)} />
              <MiniStat label="Best case (attend all)" value={`${result.best_case_pct.toFixed(1)}%`} />
              <MiniStat label="Worst case (attend none)" value={`${result.worst_case_pct.toFixed(1)}%`} />
            </div>
            <p className="mt-4 text-sm text-muted-foreground">{result.verdict}</p>
          </Card>
        )}
      </div>

      <QueryState
        isLoading={subjectsQ.isLoading}
        isError={subjectsQ.isError}
        error={subjectsQ.error as Error | null}
        onRetry={() => subjectsQ.refetch()}
      >
        <SubjectTracker subjects={subjectsQ.data ?? []} />
      </QueryState>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <h3 className="mb-4 text-base font-semibold text-foreground">{title}</h3>
      {children}
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-1 font-serif text-3xl text-foreground">{value}</div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="number"
        min={0}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}

function SubjectTracker({ subjects }: { subjects: AttendanceSubjectResponse[] }) {
  const queryClient = useQueryClient();
  const debounceRef = useRef<Record<string, ReturnType<typeof setTimeout>>>({});

  const patchMutation = useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Parameters<typeof updateAttendanceSubject>[1];
    }) => updateAttendanceSubject(id, body),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.attendanceSubjects }),
  });

  const createMutation = useMutation({
    mutationFn: createAttendanceSubject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.attendanceSubjects }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAttendanceSubject,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: queryKeys.attendanceSubjects }),
  });

  const schedulePatch = (id: string, body: Parameters<typeof updateAttendanceSubject>[1]) => {
    if (debounceRef.current[id]) clearTimeout(debounceRef.current[id]);
    debounceRef.current[id] = setTimeout(() => patchMutation.mutate({ id, body }), 600);
  };

  const totals = subjects.reduce(
    (acc, s) => ({
      held: acc.held + s.classes_held,
      attended: acc.attended + s.classes_attended,
    }),
    { held: 0, attended: 0 },
  );
  const overall = totals.held ? (totals.attended / totals.held) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
      <div className="flex items-center justify-between border-b border-border px-6 py-4">
        <div>
          <h3 className="text-base font-semibold text-foreground">Subject-wise tracker</h3>
          <p className="text-xs text-muted-foreground">Track attendance per course.</p>
        </div>
        <button
          type="button"
          onClick={() =>
            createMutation.mutate({
              name: "New subject",
              classes_held: 0,
              classes_attended: 0,
              total_semester_classes: 40,
            })
          }
          className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium text-foreground hover:bg-muted"
        >
          <Plus className="h-4 w-4" /> Add subject
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-background text-xs uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="px-6 py-3 text-left font-medium">Subject</th>
              <th className="px-6 py-3 text-left font-medium">Held</th>
              <th className="px-6 py-3 text-left font-medium">Attended</th>
              <th className="px-6 py-3 text-left font-medium">%</th>
              <th className="px-6 py-3" />
            </tr>
          </thead>
          <tbody>
            {subjects.map((s) => {
              const pct = s.classes_held ? (s.classes_attended / s.classes_held) * 100 : 0;
              const color = pct >= 75 ? "text-[#16A34A]" : pct >= 65 ? "text-[#D97706]" : "text-[#DC2626]";
              return (
                <tr key={s.id} className="border-t border-border">
                  <td className="px-6 py-3">
                    <input
                      value={s.name}
                      onChange={(e) => schedulePatch(s.id, { name: e.target.value })}
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      min={0}
                      value={s.classes_held}
                      onChange={(e) =>
                        schedulePatch(s.id, { classes_held: Number(e.target.value) })
                      }
                      className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm"
                    />
                  </td>
                  <td className="px-6 py-3">
                    <input
                      type="number"
                      min={0}
                      value={s.classes_attended}
                      onChange={(e) =>
                        schedulePatch(s.id, { classes_attended: Number(e.target.value) })
                      }
                      className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm"
                    />
                  </td>
                  <td className={`px-6 py-3 font-medium ${color}`}>{pct.toFixed(1)}%</td>
                  <td className="px-6 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => deleteMutation.mutate(s.id)}
                      className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-danger"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
            {subjects.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                  No subjects yet. Add one to get started.
                </td>
              </tr>
            )}
          </tbody>
          {subjects.length > 0 && (
            <tfoot>
              <tr className="border-t border-border bg-background">
                <td className="px-6 py-3 text-sm font-semibold text-foreground">Overall</td>
                <td className="px-6 py-3 text-sm">{totals.held}</td>
                <td className="px-6 py-3 text-sm">{totals.attended}</td>
                <td className="px-6 py-3 text-sm font-semibold text-foreground">
                  {overall.toFixed(1)}%
                </td>
                <td />
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
