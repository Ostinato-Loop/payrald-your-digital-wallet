import { createFileRoute } from "@tanstack/react-router";
import { ArrowDownLeft, ArrowUpRight, Download, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { Screen } from "@/components/payrald/Screen";
import { fmtNGN } from "@/lib/payrald/mock";
import { getTransactions } from "@/lib/payrald/api.server";
import type { TxRow } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/activity")({
  head: () => ({ meta: [{ title: "Activity · PayRald" }] }),
  loader: async () => {
    const result = await getTransactions({ data: { limit: 100 } });
    return { transactions: result.data };
  },
  component: ActivityPage,
});

const filters = ["Today", "Week", "Month", "Year"] as const;

function fmtRel(iso: string) {
  const d = new Date(iso);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 2) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function filterByPeriod(tx: TxRow[], f: (typeof filters)[number]): TxRow[] {
  const now = Date.now();
  const limits: Record<(typeof filters)[number], number> = {
    Today: 86400000,
    Week: 7 * 86400000,
    Month: 30 * 86400000,
    Year: 365 * 86400000,
  };
  return tx.filter(
    (t) => now - new Date(t.created_at).getTime() <= limits[f],
  );
}

function ActivityPage() {
  const { transactions } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [f, setF] = useState<(typeof filters)[number]>("Month");

  const list = useMemo(() => {
    const byPeriod = filterByPeriod(transactions, f);
    if (!q) return byPeriod;
    return byPeriod.filter((t) =>
      `${t.recipient_name ?? ""} ${t.recipient_alias ?? ""} ${t.narration ?? ""} ${t.type}`
        .toLowerCase()
        .includes(q.toLowerCase()),
    );
  }, [transactions, q, f]);

  const totalIn = list
    .filter((t) => t.direction === "credit")
    .reduce((s, t) => s + t.amount, 0);
  const totalOut = list
    .filter((t) => t.direction === "debit")
    .reduce((s, t) => s + t.amount, 0);

  return (
    <Screen
      title="Activity"
      subtitle="Every transfer, payment and refund"
      back={false}
      right={
        <button
          className="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface"
          aria-label="Export"
        >
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
              f === x
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {x}
          </button>
        ))}
      </div>

      {list.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          No transactions found
        </div>
      ) : (
        <div className="surface-card divide-y divide-border">
          {list.map((t) => {
            const isIn = t.direction === "credit";
            return (
              <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                <span
                  className={`flex h-10 w-10 items-center justify-center rounded-full ${
                    isIn
                      ? "bg-success/15 text-success"
                      : "bg-surface-2 text-foreground/80"
                  }`}
                >
                  {isIn ? (
                    <ArrowDownLeft className="h-4 w-4" />
                  ) : (
                    <ArrowUpRight className="h-4 w-4" />
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-medium">
                    {t.recipient_name ?? t.recipient_alias ?? t.type}
                  </div>
                  <div className="truncate text-xs text-muted-foreground">
                    {t.recipient_alias ?? t.narration ?? t.type} ·{" "}
                    {fmtRel(t.created_at)}
                  </div>
                </div>
                <div className="text-right">
                  <div
                    className={`text-sm font-semibold ${isIn ? "text-success" : "text-foreground"}`}
                  >
                    {isIn ? "+" : "−"}
                    {fmtNGN(t.amount)}
                  </div>
                  <div
                    className={`text-[10px] capitalize ${
                      t.status === "pending"
                        ? "text-warning"
                        : t.status === "failed"
                          ? "text-destructive"
                          : "text-muted-foreground"
                    }`}
                  >
                    {t.status}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </Screen>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "success" | "default";
}) {
  return (
    <div className="surface-card px-4 py-3">
      <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
        {label}
      </div>
      <div
        className={`mt-1 text-lg font-semibold ${tone === "success" ? "text-success" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}
