import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { QueryState } from "@/components/QueryState";
import { deleteSemester, fetchSemesters, saveSemester } from "@/lib/api/academic";
import { queryKeys } from "@/lib/query-keys";
import {
  GRADE_OPTIONS,
  GRADE_POINTS,
  calcSGPA,
  uid,
  type Grade,
  type Semester,
  type Subject,
} from "@/lib/store";

type LocalSemester = Semester & { number: number };

export const Route = createFileRoute("/app/sgpa")({
  component: SGPAPage,
});

function mapFromApi(data: Awaited<ReturnType<typeof fetchSemesters>>): LocalSemester[] {
  return data.map((s) => ({
    id: s.id,
    number: s.number,
    name: s.name,
    subjects: s.subjects.map((sub) => ({
      id: sub.id,
      name: sub.name,
      code: sub.code,
      credits: sub.credits,
      grade: sub.grade as Grade,
    })),
  }));
}

function SGPAPage() {
  const queryClient = useQueryClient();
  const semestersQ = useQuery({ queryKey: queryKeys.semesters, queryFn: fetchSemesters });
  const [semesters, setSemesters] = useState<LocalSemester[]>([]);
  const [activeId, setActiveId] = useState("");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (semestersQ.data) {
      const mapped = mapFromApi(semestersQ.data);
      setSemesters(mapped);
      if (!activeId && mapped[0]) setActiveId(mapped[0].id);
    }
  }, [semestersQ.data, activeId]);

  const saveMutation = useMutation({
    mutationFn: saveSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.semesters });
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSemester,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.semesters });
      queryClient.invalidateQueries({ queryKey: queryKeys.cgpa });
    },
  });

  const scheduleSave = useCallback(
    (sem: LocalSemester) => {
      if (sem.subjects.length === 0) return;
      if (saveTimer.current) clearTimeout(saveTimer.current);
      saveTimer.current = setTimeout(() => {
        saveMutation.mutate({
          number: sem.number,
          subjects: sem.subjects.map((s, i) => ({
            name: s.name,
            code: s.code ?? `SUB${i + 1}`,
            credits: s.credits,
            grade: s.grade,
          })),
        });
      }, 700);
    },
    [saveMutation],
  );

  const canAdd = semesters.length < 8;
  const current = semesters.find((s) => s.id === activeId) ?? semesters[0];
  const sgpa = useMemo(() => (current ? calcSGPA(current.subjects) : 0), [current]);

  const updateSemester = (next: LocalSemester) => {
    setSemesters((list) => list.map((x) => (x.id === next.id ? next : x)));
    scheduleSave(next);
  };

  const addSubject = () => {
    if (!current) return;
    updateSemester({
      ...current,
      subjects: [...current.subjects, { id: uid(), name: "New subject", credits: 3, grade: "A" }],
    });
  };

  return (
    <QueryState
      isLoading={semestersQ.isLoading}
      isError={semestersQ.isError}
      error={semestersQ.error as Error | null}
      onRetry={() => semestersQ.refetch()}
    >
      <div className="space-y-6">
        <p className="text-muted-foreground -mt-2">
          Add subjects, enter grades, and get your SGPA instantly.
          {saveMutation.isPending && (
            <span className="ml-2 text-primary">Saving…</span>
          )}
        </p>

        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface p-2">
          {semesters.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => setActiveId(s.id)}
              className={`rounded-full px-4 py-1.5 text-sm transition-colors ${
                s.id === (current?.id ?? "")
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              Sem {i + 1}
            </button>
          ))}
          {canAdd && (
            <button
              type="button"
              onClick={() => {
                const nextNum =
                  semesters.length > 0 ? Math.max(...semesters.map((s) => s.number)) + 1 : 1;
                const newSem: LocalSemester = {
                  id: uid(),
                  number: nextNum,
                  name: `Semester ${nextNum}`,
                  subjects: [],
                };
                setSemesters((list) => [...list, newSem]);
                setActiveId(newSem.id);
              }}
              className="inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              <Plus className="h-4 w-4" /> Add semester
            </button>
          )}
        </div>

        {current && (
          <div className="rounded-xl border border-border bg-surface shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
            <div className="flex items-center justify-between border-b border-border px-6 py-4">
              <div>
                <h3 className="text-base font-semibold text-foreground">{current.name}</h3>
                <p className="text-xs text-muted-foreground">
                  {current.subjects.length} subject{current.subjects.length === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm(`Delete ${current.name}?`)) {
                      deleteMutation.mutate(current.number, {
                        onSuccess: () => {
                          setSemesters((list) => list.filter((x) => x.id !== current.id));
                          setActiveId("");
                        },
                      });
                    }
                  }}
                  className="rounded-lg border border-border px-3 py-1.5 text-sm text-danger hover:bg-[#FEF2F2]"
                >
                  Delete sem
                </button>
                <button
                  type="button"
                  onClick={addSubject}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-background px-3 py-1.5 text-sm font-medium hover:bg-muted"
                >
                  <Plus className="h-4 w-4" /> Add Subject
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-background text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-6 py-3 text-left font-medium">Subject</th>
                    <th className="px-6 py-3 text-left font-medium">Credits</th>
                    <th className="px-6 py-3 text-left font-medium">Grade</th>
                    <th className="px-6 py-3 text-left font-medium">Points</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {current.subjects.map((sub) => (
                    <SubjectRow
                      key={sub.id}
                      sub={sub}
                      current={current}
                      updateSemester={updateSemester}
                    />
                  ))}
                  {current.subjects.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm text-muted-foreground">
                        No subjects yet. Click "Add Subject" to begin.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between rounded-xl border border-border bg-primary-soft p-6">
          <div>
            <div className="text-xs uppercase tracking-[0.14em] text-primary">Your SGPA</div>
            <div className="font-serif text-6xl text-primary">{sgpa.toFixed(2)}</div>
          </div>
          <div className="hidden text-right text-sm text-muted-foreground md:block">
            Calculated from {current?.subjects.length ?? 0} subject(s)
            <br />
            using Σ(Credits × Grade Points) / Σ(Credits)
          </div>
        </div>
      </div>
    </QueryState>
  );
}

function SubjectRow({
  sub,
  current,
  updateSemester,
}: {
  sub: Subject;
  current: LocalSemester;
  updateSemester: (s: LocalSemester) => void;
}) {
  return (
    <tr className="border-t border-border">
      <td className="px-6 py-3">
        <input
          value={sub.name}
          onChange={(e) =>
            updateSemester({
              ...current,
              subjects: current.subjects.map((x) =>
                x.id === sub.id ? { ...x, name: e.target.value } : x,
              ),
            })
          }
          className="w-full bg-transparent text-sm focus:outline-none"
        />
      </td>
      <td className="px-6 py-3">
        <input
          type="number"
          min={0}
          max={10}
          value={sub.credits}
          onChange={(e) =>
            updateSemester({
              ...current,
              subjects: current.subjects.map((x) =>
                x.id === sub.id ? { ...x, credits: Number(e.target.value) } : x,
              ),
            })
          }
          className="w-20 rounded-md border border-border bg-surface px-2 py-1 text-sm"
        />
      </td>
      <td className="px-6 py-3">
        <select
          value={sub.grade}
          onChange={(e) =>
            updateSemester({
              ...current,
              subjects: current.subjects.map((x) =>
                x.id === sub.id ? { ...x, grade: e.target.value as Grade } : x,
              ),
            })
          }
          className="rounded-md border border-border bg-surface px-2 py-1 text-sm focus:border-primary focus:outline-none"
        >
          {GRADE_OPTIONS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </td>
      <td className="px-6 py-3 text-foreground">
        {(sub.credits * GRADE_POINTS[sub.grade]).toFixed(1)}
      </td>
      <td className="px-6 py-3 text-right">
        <button
          type="button"
          onClick={() =>
            updateSemester({
              ...current,
              subjects: current.subjects.filter((x) => x.id !== sub.id),
            })
          }
          className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-danger"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </td>
    </tr>
  );
}
