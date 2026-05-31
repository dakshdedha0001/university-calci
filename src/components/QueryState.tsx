import { Skeleton } from "@/components/ui/skeleton";
import type { ReactNode } from "react";

export function QueryState({
  isLoading,
  isError,
  error,
  onRetry,
  children,
  loadingFallback,
}: {
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  onRetry?: () => void;
  children: ReactNode;
  loadingFallback?: ReactNode;
}) {
  if (isLoading) {
    return (
      loadingFallback ?? (
        <div className="space-y-3">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      )
    );
  }
  if (isError) {
    return (
      <div className="rounded-xl border border-border bg-[#FEF2F2] p-6 text-sm text-[#991B1B]">
        <p className="font-medium">Something went wrong</p>
        <p className="mt-1">{error?.message ?? "Failed to load data."}</p>
        {onRetry && (
          <button
            type="button"
            onClick={onRetry}
            className="mt-4 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            Try again
          </button>
        )}
      </div>
    );
  }
  return <>{children}</>;
}
