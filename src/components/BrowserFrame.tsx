import type { ReactNode } from "react";

export function BrowserFrame({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_30px_80px_-30px_rgba(59,110,234,0.25)] ${className}`}>
      <div className="flex items-center gap-1.5 border-b border-border bg-[#FBFBFA] px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-[#FF5F57]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#FEBC2E]" />
        <span className="h-2.5 w-2.5 rounded-full bg-[#28C840]" />
        <div className="mx-auto h-5 w-64 rounded-md bg-muted" />
      </div>
      {children}
    </div>
  );
}
