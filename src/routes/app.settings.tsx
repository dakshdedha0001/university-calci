import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { QueryState } from "@/components/QueryState";
import { fetchProfile, updateProfile } from "@/lib/api/profile";
import { queryKeys } from "@/lib/query-keys";

export const Route = createFileRoute("/app/settings")({
  component: SettingsPage,
});

function SettingsPage() {
  const queryClient = useQueryClient();
  const profileQ = useQuery({ queryKey: queryKeys.profile, queryFn: fetchProfile });
  const [name, setName] = useState("");
  const [target, setTarget] = useState(9);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (profileQ.data) {
      setName(profileQ.data.full_name);
      setTarget(profileQ.data.target_cgpa);
    }
  }, [profileQ.data]);

  const saveMutation = useMutation({
    mutationFn: () => updateProfile({ full_name: name, target_cgpa: target }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 1500);
    },
  });

  return (
    <div className="max-w-2xl space-y-6">
      <p className="text-muted-foreground -mt-2">Personalise your University Calci experience.</p>
      <QueryState
        isLoading={profileQ.isLoading}
        isError={profileQ.isError}
        error={profileQ.error as Error | null}
        onRetry={() => profileQ.refetch()}
      >
        <div className="rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)]">
          <h3 className="mb-4 text-base font-semibold text-foreground">Profile</h3>
          {saveMutation.isError && (
            <p className="mb-3 text-sm text-[#991B1B]">{(saveMutation.error as Error).message}</p>
          )}
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Display name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-sm font-medium text-foreground">Target CGPA</span>
              <input
                type="number"
                step={0.01}
                min={0}
                max={10}
                value={target}
                onChange={(e) => setTarget(Number(e.target.value))}
                className="w-full rounded-lg border border-border bg-surface px-3 py-2.5 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </label>
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => saveMutation.mutate()}
                disabled={saveMutation.isPending}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-60"
              >
                {saveMutation.isPending ? "Saving…" : "Save changes"}
              </button>
              {saved && <span className="text-sm text-[#16A34A]">Saved.</span>}
            </div>
          </div>
        </div>
      </QueryState>
    </div>
  );
}
