import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Screen } from "@/components/payrald/Screen";
import { fmtNGN, fmtRel, transactions } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({ meta: [{ title: "Activity · PayRald" }] }),
  component: ActivityPage,
});

const filters = ["Today", "Week", "Month", "Year"] as const;

function ActivityPage() {
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]>("Month");

  const list = useMemo(() => {
    return transactions.filter((t) =>
      q ? `${t.party} ${t.partyHandle} ${t.note ?? ""}`.toLowerCase().includes(q.toLowerCase()) : true
    );
  }, [q]);

  const totalIn = list.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalOut = list.filter((t) => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);

  return (
    <Screen
      title="Activity"
      subtitle="Every transfer, payment and refund"
      back={false}
      right={
        <button className="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface" aria-label="Export">
          <Download className="h-4 w-4" />
        </button>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <Stat label="Money in" value={fmtNGN(totalIn)} tone="success" />
        <Stat label="Money out" value={fmtNGN(totalOut)} tone="default" />
      </div>

      <label className="surface-card flex items-center gap-2 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search activity"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {filters.map((x) => (
          <button
            key={x}
            onClick={() => setF(x)}
            className={`tap shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
              f === x ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      <div className="surface-card divide-y divide-border">
        {list.map((t) => {
          const isIn = t.amount > 0;
          return (
            <div key={t.id} className="flex items-center gap-3 px-4 py-3">
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  isIn ? "bg-success/15 text-success" : "bg-surface-2 text-foreground/80"
                }`}
              >
                {isIn ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
              </span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium">{t.party}</div>
                <div className="truncate text-xs text-muted-foreground">
                  {t.partyHandle} · {t.note ?? t.kind} · {fmtRel(t.at)}
                </div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${isIn ? "text-success" : "text-foreground"}`}>
                  {isIn ? "+" : "−"}
                  {fmtNGN(Math.abs(t.amount))}
                </div>
                <div
                  className={`text-[10px] capitalize ${
                    t.status === "pending" ? "text-warning" : t.status === "failed" ? "text-destructive" : "text-muted-foreground"
                  }`}
                >
                  {t.status}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Screen>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone: "success" | "default" }) {
  return (
    <div className="surface-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className={`mt-1 text-lg font-semibold ${tone === "success" ? "text-success" : ""}`}>{value}</div>
    </div>
  );
}
