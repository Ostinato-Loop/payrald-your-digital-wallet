import { createFileRoute, Link, Outlet, useRouterState } from "@tanstack/react-router";
import { Home, Wallet, Activity, QrCode, Store } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_app")({
  component: AppShell,
});

type Tab = { to: string; label: string; icon: typeof Home; center?: boolean };
const tabs: Tab[] = [
  { to: "/home", label: "Home", icon: Home },
  { to: "/pay", label: "Pay", icon: Store },
  { to: "/qr", label: "Scan", icon: QrCode, center: true },
  { to: "/activity", label: "Activity", icon: Activity },
  { to: "/wallet", label: "Wallet", icon: Wallet },
];

function AppShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="relative mx-auto flex min-h-[100dvh] w-full max-w-[460px] flex-col bg-background">
      <main className="flex-1 pb-28">
        <Outlet />
      </main>

      {/* Bottom Tab Bar */}
      <nav
        className="fixed inset-x-0 bottom-0 z-40 mx-auto w-full max-w-[460px] px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2"
        aria-label="Primary"
      >
        <div className="surface-card flex items-end justify-between gap-1 px-2 py-2 backdrop-blur">
          {tabs.map((t) => {
            const active = pathname === t.to || (t.to !== "/home" && pathname.startsWith(t.to));
            const Icon = t.icon;
            if (t.center) {
              return (
                <Link
                  key={t.to}
                  to={t.to}
                  className="tap relative -mt-8 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-glow-red"
                  aria-label={t.label}
                >
                  <Icon className="h-6 w-6" />
                </Link>
              );
            }
            return (
              <Link
                key={t.to}
                to={t.to}
                className={cn(
                  "tap flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-1.5 text-[10px] font-medium",
                  active ? "text-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className={cn("h-[22px] w-[22px]", active && "text-primary")} />
                <span>{t.label}</span>
                {active && <span className="h-0.5 w-5 rounded-full bg-primary" />}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
