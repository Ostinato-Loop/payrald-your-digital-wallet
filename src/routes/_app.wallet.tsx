import { createFileRoute, Link } from "@tanstack/react-router";
import { Banknote, Building2, CreditCard, Eye, EyeOff, Plus } from "lucide-react";
import { useState } from "react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { fmtNGN } from "@/lib/payrald/mock";
import { getWallet } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/wallet")({
  head: () => ({ meta: [{ title: "Wallet · PayRald" }] }),
  loader: async () => {
    const result = await getWallet();
    return { wallet: result.data, walletError: result.error };
  },
  component: WalletPage,
});

function WalletPage() {
  const { wallet, walletError } = Route.useLoaderData();
  const [hidden, setHidden] = useState(false);

  const available = wallet?.balance ?? 0;
  const ledger = wallet?.ledger_balance ?? 0;
  const pending = Math.max(0, ledger - available);

  return (
    <Screen
      title="Wallet"
      subtitle="ALIA-routed funds, never an account number"
      back={false}
    >
      <section
        className="relative overflow-hidden rounded-3xl border border-border p-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.18 0.02 260) 0%, oklch(0.08 0 0) 60%), radial-gradient(circle at 90% 10%, color-mix(in oklab, #e11d2a 35%, transparent), transparent 60%)",
        }}
      >
        <div className="flex items-start justify-between">
          <div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-white/50">
              Total balance
            </div>
            <div className="mt-2 text-3xl font-semibold">
              {walletError
                ? "₦ —"
                : hidden
                ? "₦ ••••••"
                : fmtNGN(available + pending)}
            </div>
            {wallet?.virtual_account_number && (
              <div className="mt-1 text-xs text-white/40">
                VA: {wallet.virtual_bank_name} {wallet.virtual_account_number}
              </div>
            )}
          </div>
          <button
            onClick={() => setHidden((v) => !v)}
            className="tap flex h-9 w-9 items-center justify-center rounded-full bg-white/10"
            aria-label="Toggle balance"
          >
            {hidden ? (
              <Eye className="h-4 w-4" />
            ) : (
              <EyeOff className="h-4 w-4" />
            )}
          </button>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-xs">
          <div className="rounded-2xl bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-white/50">
              Available
            </div>
            <div className="mt-1 text-sm font-semibold">
              {hidden ? "•••" : fmtNGN(available)}
            </div>
          </div>
          <div className="rounded-2xl bg-white/5 p-3">
            <div className="text-[10px] uppercase tracking-wider text-white/50">
              Pending
            </div>
            <div className="mt-1 text-sm font-semibold text-warning">
              {hidden ? "•••" : fmtNGN(pending)}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-2 gap-3">
        <button className="tap surface-card flex items-center gap-3 p-4 text-left">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/15 text-primary">
            <Plus className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Add money</div>
            <div className="text-[10px] text-muted-foreground">
              Bank, card or transfer
            </div>
          </div>
        </button>
        <Link
          to="/withdraw"
          className="tap surface-card flex items-center gap-3 p-4 text-left"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mustard/20 text-mustard">
            <Banknote className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Withdraw</div>
            <div className="text-[10px] text-muted-foreground">
              To linked institution
            </div>
          </div>
        </Link>
      </div>

      <div>
        <SectionTitle
          action={
            <button className="text-xs text-primary">Manage</button>
          }
        >
          Funding methods
        </SectionTitle>
        <div className="surface-card divide-y divide-border">
          <MethodRow
            icon={<Building2 className="h-4 w-4" />}
            title="Virtual account"
            subtitle={
              wallet?.virtual_account_number
                ? `${wallet.virtual_bank_name} · ${wallet.virtual_account_number}`
                : "ALIA assigns one for inflows"
            }
            badge={wallet?.virtual_account_number ? "Active" : "Soon"}
          />
          <MethodRow
            icon={<Banknote className="h-4 w-4" />}
            title="Bank transfer"
            subtitle="Top up from any African bank"
            badge="Active"
          />
          <MethodRow
            icon={<CreditCard className="h-4 w-4" />}
            title="Card funding"
            subtitle="Visa, Mastercard, Verve"
            badge="Active"
          />
        </div>
      </div>
    </Screen>
  );
}

function MethodRow({
  icon,
  title,
  subtitle,
  badge,
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  badge: string;
}) {
  const active = badge === "Active";
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{subtitle}</div>
      </div>
      <span className={`chip ${active ? "text-success" : "text-warning"}`}>
        {badge}
      </span>
    </div>
  );
}
