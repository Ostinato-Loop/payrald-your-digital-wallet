import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, ArrowDownLeft, ArrowUpRight, CreditCard, ShieldCheck } from "lucide-react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";

export const Route = createFileRoute("/_app/notifications")({
  head: () => ({ meta: [{ title: "Notifications · PayRald" }] }),
  component: NotifPage,
});

const items = [
  { icon: ArrowDownLeft, tone: "success", title: "₦25,000 from @amaka", at: "2m ago", body: "Lunch split — settled instantly." },
  { icon: CreditCard, tone: "default", title: "Spotify charged ₦1,900", at: "1h ago", body: "Recurring subscription via ALIA." },
  { icon: ShieldCheck, tone: "success", title: "New trusted device", at: "3h ago", body: "MacBook Pro · Abuja added to trusted devices." },
  { icon: ArrowUpRight, tone: "default", title: "₦8,000 sent to @tundea", at: "Yesterday", body: "Cab fare." },
  { icon: AlertTriangle, tone: "warning", title: "Unusual login attempt", at: "2d ago", body: "From Lagos · we blocked it. Review devices." },
];

function NotifPage() {
  return (
    <Screen title="Notifications" subtitle="Real-time across payments, security and merchants">
      <div className="flex gap-2">
        {["All", "Payments", "Security", "Merchants"].map((c, i) => (
          <button
            key={c}
            className={`tap rounded-full border px-3 py-1.5 text-xs font-medium ${
              i === 0 ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <SectionTitle>Today</SectionTitle>
      <div className="surface-card divide-y divide-border">
        {items.map((n, i) => (
          <div key={i} className="flex items-start gap-3 px-4 py-3">
            <span
              className={`flex h-10 w-10 items-center justify-center rounded-full ${
                n.tone === "success"
                  ? "bg-success/15 text-success"
                  : n.tone === "warning"
                  ? "bg-warning/15 text-warning"
                  : "bg-surface-2 text-foreground/80"
              }`}
            >
              <n.icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <div className="truncate text-sm font-medium">{n.title}</div>
                <div className="shrink-0 text-[10px] text-muted-foreground">{n.at}</div>
              </div>
              <div className="text-xs text-muted-foreground">{n.body}</div>
            </div>
          </div>
        ))}
      </div>
    </Screen>
  );
}
