import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CalendarCheck,
  Calculator,
  LineChart as LineChartIcon,
  Target,
  ClipboardList,
  Sparkles,
} from "lucide-react";
import { LandingNav } from "@/components/LandingNav";
import { BrowserFrame } from "@/components/BrowserFrame";
import { DashboardMockup } from "@/components/DashboardMockup";
import { Logo } from "@/components/brand/Logo";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "University Calci — Academic performance, beautifully organized" },
      {
        name: "description",
        content:
          "Track attendance, calculate SGPA & CGPA, and plan your semester — all in one place.",
      },
      { property: "og:title", content: "University Calci" },
      {
        property: "og:description",
        content: "Track attendance, calculate SGPA & CGPA, and plan your semester.",
      },
    ],
  }),
  component: Landing,
});

const features = [
  {
    icon: CalendarCheck,
    title: "Attendance Tracker",
    desc: "Know exactly when you can miss class — and when you can't.",
  },
  {
    icon: Calculator,
    title: "SGPA Calculator",
    desc: "Add subjects, enter grades. Get your GPA instantly.",
  },
  {
    icon: LineChartIcon,
    title: "CGPA Dashboard",
    desc: "See your cumulative performance across every semester.",
  },
  {
    icon: Target,
    title: "Improvement Analyzer",
    desc: "Find out exactly what grades you need to hit your target.",
  },
  {
    icon: ClipboardList,
    title: "Semester Planner",
    desc: "Plan ahead with smart academic goal tracking.",
  },
  {
    icon: Sparkles,
    title: "Clean Reports",
    desc: "Beautiful summaries you'll actually want to look at.",
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <LandingNav />

      {/* Hero */}
      <section className="hero-wash">
        <div className="mx-auto max-w-5xl px-6 pt-20 pb-16 text-center">
          <span className="inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-medium tracking-wide text-primary">
            Built for serious students
          </span>
          <h1 className="mt-6 text-5xl md:text-[72px] leading-[1.05] text-foreground">
            Your academic performance,
            <br />
            <span className="italic text-primary">beautifully organized.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            Track attendance, calculate SGPA & CGPA, and plan your semester — all in one
            place.
          </p>
          <div className="mt-8 flex items-center justify-center gap-3">
            <Link
              to="/app/dashboard"
              className="rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Open app
            </Link>
            <a
              href="#how"
              className="inline-flex items-center gap-1.5 rounded-lg px-4 py-3 text-sm font-medium text-foreground hover:text-primary"
            >
              See how it works <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <div className="mt-16">
            <BrowserFrame>
              <DashboardMockup />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="border-t border-border bg-background">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <div className="text-center">
            <div className="text-xs font-medium uppercase tracking-[0.18em] text-primary">
              Everything you need
            </div>
            <h2 className="mt-3 text-4xl md:text-5xl text-foreground">
              One platform. Every academic metric.
            </h2>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="group rounded-xl border border-border bg-surface p-6 shadow-[0_1px_4px_rgba(0,0,0,0.04)] transition-shadow hover:shadow-[0_8px_24px_-12px_rgba(59,110,234,0.18)]"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <h3 className="mt-5 text-base font-semibold text-foreground">{f.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section id="how" className="bg-[#F3F4F6]">
        <div className="mx-auto max-w-6xl px-6 py-24">
          <h2 className="mx-auto max-w-3xl text-center text-4xl md:text-5xl">
            A dashboard that works as hard as you do.
          </h2>
          <div className="mt-12">
            <BrowserFrame>
              <DashboardMockup />
            </BrowserFrame>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-background">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center">
          <h2 className="text-4xl md:text-5xl">Ready to take control of your academics?</h2>
          <p className="mt-4 text-muted-foreground">
            Join thousands of students already tracking smarter.
          </p>
          <Link
            to="/app/dashboard"
            className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90"
          >
            Open app
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-surface">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-6 px-6 py-10 md:flex-row md:items-center">
          <div>
            <Logo />
            <p className="mt-2 text-sm text-muted-foreground">
              Academic performance, beautifully organized.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm text-muted-foreground">
            <a href="#" className="hover:text-foreground">Privacy</a>
            <a href="#" className="hover:text-foreground">Terms</a>
            <a href="#" className="hover:text-foreground">Contact</a>
          </div>
          <div className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} University Calci
          </div>
        </div>
      </footer>
    </div>
  );
}
