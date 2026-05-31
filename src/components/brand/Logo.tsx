import { Link } from "@tanstack/react-router";

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link to="/" className={`inline-flex items-baseline gap-1 ${className}`}>
      <span className="font-serif text-[20px] leading-none text-foreground">University</span>
      <span className="font-serif text-[20px] leading-none text-primary italic">Calci</span>
    </Link>
  );
}
