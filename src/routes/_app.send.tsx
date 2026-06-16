import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search, ShieldCheck, XCircle } from "lucide-react";
import { useRef, useState } from "react";
import { Avatar } from "@/components/payrald/Avatar";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { fmtNGN } from "@/lib/payrald/mock";
import {
  resolveAlias,
  initiateTransfer,
  getWallet,
} from "@/lib/payrald/api.server";
import type { ResolvedIdentity, WalletData } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/send")({
  head: () => ({ meta: [{ title: "Send · PayRald" }] }),
  loader: async () => {
    const result = await getWallet();
    return { wallet: result.data };
  },
  component: SendPage,
});

type Step = "find" | "amount" | "review" | "success";

function SendPage() {
  const { wallet } = Route.useLoaderData();
  const [step, setStep] = useState<Step>("find");
  const [query, setQuery] = useState("");
  const [resolved, setResolved] = useState<ResolvedIdentity | null>(null);
  const [resolveErr, setResolveErr] = useState<string | null>(null);
  const [resolving, setResolving] = useState(false);
  const [amount, setAmount] = useState("");
  const [narration, setNarration] = useState("");
  const [sending, setSending] = useState(false);
  const [sendErr, setSendErr] = useState<string | null>(null);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  const balance = wallet?.balance ?? 0;

  const onQueryChange = (v: string) => {
    setQuery(v);
    setResolved(null);
    setResolveErr(null);
    if (debounce.current) clearTimeout(debounce.current);
    if (!v.trim()) return;
    debounce.current = setTimeout(async () => {
      setResolving(true);
      try {
        const result = await resolveAlias({
          data: { alias: v.trim() },
        });
        if (result.error) {
          setResolveErr(result.error);
        } else {
          setResolved(result.data);
        }
      } catch {
        setResolveErr("Could not resolve alias");
      } finally {
        setResolving(false);
      }
    }, 600);
  };

  const confirm = async () => {
    if (!resolved || !amount || Number(amount) <= 0) return;
    setSending(true);
    setSendErr(null);
    try {
      await initiateTransfer({
        data: {
          alias: resolved.alias,
          amount: Number(amount),
          narration: narration || undefined,
        },
      });
      setStep("success");
    } catch (e: unknown) {
      setSendErr(
        e instanceof Error ? e.message : "Transfer failed. Please try again.",
      );
    } finally {
      setSending(false);
    }
  };

  if (step === "success") {
    return (
      <Screen back={false} title="" className="items-center pt-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <div className="text-xl font-semibold">Sent successfully</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {fmtNGN(Number(amount))} to {resolved?.display_name ?? resolved?.alias}
            </div>
          </div>
          <button
            className="tap mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            onClick={() => {
              setStep("find");
              setResolved(null);
              setAmount("");
              setQuery("");
              setNarration("");
            }}
          >
            Done
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Send money" subtitle="Powered by ALIA">
      {step === "find" && (
        <>
          <label className="surface-card flex items-center gap-2 px-4 py-3">
            <Search className="h-4 w-4 text-muted-foreground" />
            <input
              autoFocus
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="@username, email, phone or business"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
            {resolving && (
              <span className="text-xs text-muted-foreground">Looking up…</span>
            )}
          </label>

          {resolveErr && query && (
            <div className="flex items-center gap-2 rounded-xl bg-destructive/10 px-4 py-3">
              <XCircle className="h-4 w-4 text-destructive" />
              <span className="text-xs text-destructive">{resolveErr}</span>
            </div>
          )}

          {resolved && (
            <button
              className="tap surface-card flex items-center gap-3 px-3 py-3"
              onClick={() => setStep("amount")}
            >
              <Avatar
                name={resolved.display_name || resolved.alias}
                color="#0a1a3a"
                size={44}
              />
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {resolved.display_name}
                  {resolved.verified && (
                    <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {resolved.alias}
                </div>
              </div>
              {resolved.verified && (
                <span className="chip">
                  <ShieldCheck className="h-3 w-3 text-success" /> ALIA
                </span>
              )}
            </button>
          )}

          {!query && (
            <div>
              <SectionTitle>Tip</SectionTitle>
              <p className="text-xs text-muted-foreground">
                Enter an @alias, email, or phone number to find anyone on the
                ALIA network.
              </p>
            </div>
          )}
        </>
      )}

      {step === "amount" && resolved && (
        <>
          <div className="surface-card flex items-center gap-3 px-3 py-3">
            <Avatar
              name={resolved.display_name || resolved.alias}
              color="#0a1a3a"
              size={44}
            />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{resolved.display_name}</div>
              <div className="text-xs text-muted-foreground">
                {resolved.alias}
              </div>
            </div>
            <button
              className="text-xs text-primary"
              onClick={() => setStep("find")}
            >
              Change
            </button>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 py-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              You send
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-muted-foreground">
                ₦
              </span>
              <input
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) =>
                  setAmount(e.target.value.replace(/[^0-9.]/g, ""))
                }
                placeholder="0"
                className="w-44 bg-transparent text-center text-5xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
              />
            </div>
            <div className="text-[11px] text-muted-foreground">
              Available {fmtNGN(balance)}
            </div>
            <div className="mt-3 flex gap-2">
              {[5000, 10000, 25000, 50000].map((p) => (
                <button
                  key={p}
                  className="tap rounded-full bg-surface-2 px-3 py-1.5 text-xs text-muted-foreground"
                  onClick={() => setAmount(String(p))}
                >
                  +{p.toLocaleString()}
                </button>
              ))}
            </div>
          </div>
          <label className="surface-card flex items-center gap-2 px-4 py-3">
            <input
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="Add a note (optional)"
              maxLength={100}
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>
          <button
            disabled={!amount || Number(amount) <= 0}
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
            onClick={() => setStep("review")}
          >
            Continue
          </button>
        </>
      )}

      {step === "review" && resolved && (
        <>
          <div className="surface-card flex flex-col items-center gap-4 px-4 py-6 text-center">
            <Avatar
              name={resolved.display_name || resolved.alias}
              color="#0a1a3a"
              size={60}
            />
            <div>
              <div className="text-sm font-medium">
                Sending to {resolved.display_name}
              </div>
              <div className="text-xs text-muted-foreground">
                {resolved.alias}
              </div>
            </div>
            <div className="text-3xl font-semibold">
              {fmtNGN(Number(amount))}
            </div>
            <span className="chip">
              <ShieldCheck className="h-3 w-3 text-success" /> Settled by ALIA
              · Free
            </span>
          </div>
          <div className="surface-card divide-y divide-border text-sm">
            <Row label="Fee" value="₦0" />
            <Row label="Arrives" value="Instantly" />
            <Row label="Trust check" value="Passed" valueClass="text-success" />
            {narration && <Row label="Note" value={narration} />}
          </div>
          {sendErr && (
            <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
              {sendErr}
            </p>
          )}
          <button
            disabled={sending}
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
            onClick={confirm}
          >
            {sending ? "Sending…" : "Confirm & send"}
          </button>
        </>
      )}
    </Screen>
  );
}

function Row({
  label,
  value,
  valueClass = "",
}: {
  label: string;
  value: string;
  valueClass?: string;
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
