import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowDownLeft,
  ArrowUpRight,
  Bell,
  CheckCircle2,
  CreditCard,
  Eye,
  EyeOff,
  Plus,
  QrCode as QrCodeIcon,
  ScanLine,
  ShieldCheck,
  Wallet as WalletIcon,
} from "lucide-react";
import { useState } from "react";
import payraldMark from "@/assets/payrald-mark.png";
import { SectionTitle } from "@/components/payrald/Screen";
import { VendorLogo } from "@/components/payrald/VendorLogo";
import { fmtNGN } from "@/lib/payrald/mock";
import {
  getWallet,
  getTransactions,
  getMerchants,
} from "@/lib/payrald/api.server";
import type { TxRow, MerchantRow } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/home")({
  head: () => ({ meta: [{ title: "PayRald — Home" }] }),
  loader: async () => {
    const [walletResult, txResult, merchantsResult] = await Promise.all([
      getWallet(),
      getTransactions({ data: { limit: 8 } }),
      getMerchants(),
    ]);
    return {
      wallet: walletResult.data,
      walletError: walletResult.error,
      transactions: txResult.data,
      merchants: merchantsResult.data,
    };
  },
  component: HomePage,
});

function HomePage() {
  const { me } = Route.useRouteContext();
  const { wallet, walletError, transactions, merchants } =
    Route.useLoaderData();
  const [hidden, setHidden] = useState(false);

  const balance = wallet?.balance ?? 0;
  const ledger = wallet?.ledger_balance ?? 0;
  const pending = Math.max(0, ledger - balance);

  const displayName =
    me?.name ?? me?.username ?? me?.email?.split("@")[0] ?? "You";
  const handle = me?.username ? `@${me.username}` : me?.email ?? "";

  return (
    <div className="flex flex-col gap-6 px-5 pb-6 pt-6">
      {/* Top bar */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src={payraldMark} alt="PayRald" className="h-9 w-9" />
          <div>
            <div className="flex items-center gap-1.5 text-sm font-semibold">
              {handle || displayName}
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
            </div>
            <div className="text-[11px] text-muted-foreground">
              {me?.email ?? ""}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/security"
            className="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface"
            aria-label="Security"
          >
            <ShieldCheck className="h-5 w-5 text-success" />
          </Link>
          <Link
            to="/notifications"
            className="tap relative flex h-10 w-10 items-center justify-center rounded-full bg-surface"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-primary" />
          </Link>
        </div>
      </header>

      {/* Balance card */}
      <section
        className="relative overflow-hidden rounded-3xl border border-border p-5 text-white"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.02 260) 0%, oklch(0.1 0 0) 60%), radial-gradient(circle at 80% 10%, color-mix(in oklab, #e11d2a 35%, transparent), transparent 60%)",
        }}
      >
        <div
          aria-hidden
          className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full opacity-40 blur-3xl"
          style={{ background: "#e11d2a" }}
        />
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              Available balance
            </div>
            <div className="mt-2 flex items-baseline gap-2">
              <span className="text-[34px] font-semibold tracking-tight">
                {walletError
                  ? "₦ —"
                  : hidden
                    ? "₦ ••••••"
                    : fmtNGN(balance)}
              </span>
            </div>
            <div className="mt-1 text-xs text-white/50">
              {wallet?.currency ?? "NGN"} wallet · Settled instantly
            </div>
          </div>
          <button
            className="tap flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            onClick={() => setHidden((v) => !v)}
            aria-label="Toggle balance visibility"
          >
            {hidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>
        {pending > 0 && !hidden && (
          <div className="mt-2 text-xs text-white/40">
            +{fmtNGN(pending)} pending
          </div>
        )}
        <div className="mt-5 flex gap-2">
          <Link
            to="/wallet"
            className="tap inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
          >
            <Plus className="h-3.5 w-3.5" /> Add money
          </Link>
          <Link
            to="/withdraw"
            className="tap inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-xs font-medium hover:bg-white/15"
          >
            <WalletIcon className="h-3.5 w-3.5" /> Withdraw
          </Link>
          <span className="ml-auto inline-flex items-center gap-1 rounded-full border border-white/15 px-2.5 py-1 text-[10px] uppercase tracking-wider text-white/60">
            <ShieldCheck className="h-3 w-3 text-success" /> ALIA verified
          </span>
        </div>
      </section>

      {/* Quick actions */}
      <section className="grid grid-cols-4 gap-2">
        {[
          { label: "Send", icon: ArrowUpRight, to: "/send" },
          { label: "Receive", icon: ArrowDownLeft, to: "/receive" },
          { label: "Pay", icon: CreditCard, to: "/pay" },
          { label: "Scan", icon: ScanLine, to: "/qr" },
        ].map((a) => (
          <Link
            key={a.label}
            to={a.to}
            className="tap surface-card flex flex-col items-center gap-2 px-2 py-4 text-center"
          >
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
              <a.icon className="h-5 w-5" />
            </span>
            <span className="text-xs font-medium">{a.label}</span>
          </Link>
        ))}
      </section>

      {/* Pay merchants — horizontal scroll with real logos */}
      {merchants.length > 0 && (
        <section>
          <SectionTitle
            action={
              <Link to="/pay" className="text-xs text-primary">
                See all
              </Link>
            }
          >
            Pay merchants
          </SectionTitle>
          <div className="no-scrollbar -mx-5 flex gap-3 overflow-x-auto px-5">
            {merchants.slice(0, 10).map((m: MerchantRow) => (
              <Link
                key={m.id}
                to="/merchant/$id"
                params={{ id: m.alias }}
                className="tap flex w-[72px] shrink-0 flex-col items-center gap-2 text-center"
              >
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 bg-white/5 p-1 shadow-sm">
                  <VendorLogo name={m.name} size={44} rounded="rounded-xl" />
                </div>
                <span className="w-full truncate text-[10px] text-muted-foreground">
                  {m.name}
                </span>
              </Link>
            ))}
            <Link
              to="/pay"
              className="tap flex w-[72px] shrink-0 flex-col items-center gap-2 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-dashed border-border bg-surface text-muted-foreground">
                <Plus className="h-5 w-5" />
              </div>
              <span className="w-full truncate text-[10px] text-muted-foreground">
                More
              </span>
            </Link>
          </div>
        </section>
      )}

      {/* Recent activity */}
      {transactions.length > 0 && (
        <section>
          <SectionTitle
            action={
              <Link to="/activity" className="text-xs text-primary">
                All
              </Link>
            }
          >
            Recent activity
          </SectionTitle>
          <div className="surface-card divide-y divide-border">
            {transactions.slice(0, 4).map((t: TxRow) => {
              const isIn = t.direction === "credit";
              return (
                <Link
                  to="/activity"
                  key={t.id}
                  className="tap flex items-center gap-3 px-3 py-3 first:rounded-t-2xl last:rounded-b-2xl"
                >
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
                      {new Date(t.created_at).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="text-right">
                    <div
                      className={`text-sm font-semibold ${isIn ? "text-success" : "text-foreground"}`}
                    >
                      {isIn ? "+" : ""}
                      {fmtNGN(t.amount)}
                    </div>
                    <div className="text-[10px] capitalize text-muted-foreground">
                      {t.status}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* ALIA identity teaser */}
      <Link
        to="/receive"
        className="tap surface-card flex items-center gap-3 px-4 py-4"
      >
        <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 text-primary">
          <QrCodeIcon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-medium">Your ALIA identity</div>
          <div className="text-xs text-muted-foreground">
            Share {handle || "@you"} to get paid instantly
          </div>
        </div>
        <span className="text-xs font-medium text-primary">Share</span>
      </Link>
    </div>
  );
}
