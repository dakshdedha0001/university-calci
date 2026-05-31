import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { QueryState } from "@/components/QueryState";
import { fetchCgpa, fetchImprovements, planTargetCgpa } from "@/lib/api/academic";
import { fetchProfile } from "@/lib/api/profile";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/app/improvement")({
  component: ImprovementPage,
});

function ImprovementPage() {
  const profileQ = useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });
  const cgpaQ = useQuery({ queryKey: queryKeys.cgpa, queryFn: fetchCgpa });
  const improvementsQ = useQuery({
    queryKey: queryKeys.improvements,
    queryFn: fetchImprovements,
    retry: false,
  });

  const [target, setTarget] = useState<number | "">("");
  const [calculated, setCalculated] = useState(false);

  const planMutation = useMutation({
    mutationFn: (t: number) => planTargetCgpa(t),
  });

  const targetVal = Number(target) || profileQ.data?.target_cgpa || 9;
  const currentCgpa = cgpaQ.data?.cgpa ?? 0;
  const completed = cgpaQ.data?.semesters.length ?? 0;
  const totalSem = profileQ.data?.total_semesters ?? 8;
  const remaining = Math.max(0, totalSem - completed);

  const requiredAvg = useMemo(() => {
    if (remaining === 0) return 0;
    return (targetVal * totalSem - currentCgpa * completed) / remaining;
  }, [targetVal, totalSem, currentCgpa, completed, remaining]);

  const feasibility =
    requiredAvg <= 8.5
      ? { label: "Achievable", c: "bg-[#DCFCE7] text-[#166534]" }
      : requiredAvg <= 9.5
        ? { label: "Challenging", c: "bg-[#FEF3C7] text-[#92400E]" }
        : { label: "Very Difficult", c: "bg-[#FEE2E2] text-[#991B1B]" };

  return (
    <div className="space-y-8">
      <p className="text-muted-foreground -mt-2">
        Find out exactly what you need to score to hit your CGPA target.
      </p>

      <QueryState
        isLoading={profileQ.isLoading || cgpaQ.isLoading}
        isError={profileQ.isError || cgpaQ.isError}
        error={(profileQ.error ?? cgpaQ.error) as Error | null}
        onRetry={() => {
          profileQ.refetch();
          cgpaQ.refetch();
        }}
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Your numbers">
            <div className="grid grid-cols-2 gap-4">
              <ReadOnlyField label="Current CGPA" value={currentCgpa.toFixed(2)} />
              <ReadOnlyField label="Completed semesters" value={String(completed)} />
              <NumberField
                label="Target CGPA"
                value={target === "" ? targetVal : target}
                onChange={setTarget}
                step={0.01}
              />
              <ReadOnlyField label="Remaining semesters" value={String(remaining)} />
            </div>
            <button
              type="button"
              onClick={() => {
                setCalculated(true);
                if (completed > 0) planMutation.mutate(targetVal);
              }}
              className="mt-5 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Calculate
            </button>
          </Card>

          {calculated && (
            <Card title="The plan">
              <div className="flex items-baseline gap-3">
                <div className="font-serif text-5xl text-foreground">
                  {requiredAvg.toFixed(2)}
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${feasibility.c}`}>
                  {feasibility.label}
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">
                You need an average SGPA of{" "}
                <span className="font-medium text-foreground">{requiredAvg.toFixed(2)}</span> across your{" "}
                {remaining} remaining semester{remaining === 1 ? "" : "s"} to reach a CGPA of{" "}
                {targetVal.toFixed(2)}.
              </p>
              <div className="mt-4 rounded-lg bg-primary-soft px-4 py-3 text-sm text-primary">
                You're {Math.max(0, targetVal - currentCgpa).toFixed(2)} points away from your target.
              </div>
            </Card>
          )}
        </div>
      </QueryState>

      {improvementsQ.data && improvementsQ.data.top.length > 0 && (
        <Card title="Top grade improvements (from your subjects)">
          <ul className="space-y-3 text-sm">
            {improvementsQ.data.top.slice(0, 5).map((sc, i) => (
              <li key={`${sc.code}-${sc.new_grade}`} className="rounded-lg border border-border p-4">
                <span className="font-medium text-foreground">
                  #{i + 1} {sc.subject}
                </span>
                <span className="text-muted-foreground"> — {sc.sem_name}</span>
                <div className="mt-1 text-muted-foreground">
                  {sc.old_grade} → {sc.new_grade} · CGPA +{sc.cgpa_gain.toFixed(4)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      {planMutation.data && planMutation.data.roadmap.length > 0 && (
        <Card title="Roadmap to target CGPA">
          <ul className="space-y-3 text-sm">
            {planMutation.data.roadmap.map((step) => (
              <li key={step.step} className="rounded-lg border border-border p-4">
                <span className="font-medium">
                  Step {step.step}: {step.subject}
                </span>
                <div className="text-muted-foreground">
                  {step.from_grade} → {step.to_grade} · CGPA {step.new_cgpa.toFixed(2)}
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}
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

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <div className="rounded-lg border border-border bg-background px-3 py-2.5 text-sm text-foreground">
        {value}
      </div>
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
  step = 1,
}: {
  label: string;
  value: number | "";
  onChange: (v: number | "") => void;
  step?: number;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-foreground">{label}</span>
      <input
        type="number"
        step={step}
        value={value}
        onChange={(e) => onChange(e.target.value === "" ? "" : Number(e.target.value))}
        className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
      />
    </label>
  );
}
