// Small visual mockup of the dashboard for the landing hero/preview sections.
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

const data = [
  { name: "S1", sgpa: 8.2 },
  { name: "S2", sgpa: 8.6 },
  { name: "S3", sgpa: 9.1 },
  { name: "S4", sgpa: 8.8 },
  { name: "S5", sgpa: 9.0 },
];

export function DashboardMockup() {
  return (
    <div className="grid grid-cols-12 gap-4 bg-background p-6">
      <aside className="col-span-3 hidden flex-col gap-1 rounded-xl border border-border bg-surface p-3 md:flex">
        {["Dashboard", "Attendance", "SGPA", "CGPA", "Improvement"].map((label, i) => (
          <div
            key={label}
            className={`rounded-md px-3 py-2 text-sm ${
              i === 0 ? "bg-primary-soft text-primary font-medium" : "text-muted-foreground"
            }`}
          >
            {label}
          </div>
        ))}
      </aside>
      <div className="col-span-12 md:col-span-9 flex flex-col gap-4">
        <div className="grid grid-cols-4 gap-3">
          {[
            { l: "CGPA", v: "8.71" },
            { l: "Attendance", v: "82%" },
            { l: "Best SGPA", v: "9.1" },
            { l: "Target", v: "9.0" },
          ].map((c) => (
            <div key={c.l} className="rounded-xl border border-border bg-surface p-4">
              <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{c.l}</div>
              <div className="mt-1 font-serif text-3xl text-foreground">{c.v}</div>
            </div>
          ))}
        </div>
        <div className="rounded-xl border border-border bg-surface p-4">
          <div className="mb-2 text-sm font-medium text-foreground">Semester Overview</div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#F3F4F6" vertical={false} />
                <XAxis dataKey="name" stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 10]} stroke="#6B7280" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: "#EEF3FF" }} />
                <Bar dataKey="sgpa" fill="#3B6EEA" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
