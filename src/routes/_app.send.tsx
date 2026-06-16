import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Search, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";
import { Avatar } from "@/components/payrald/Avatar";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { fmtNGN, recents } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/send")({
  head: () => ({ meta: [{ title: "Send · PayRald" }] }),
  component: SendPage,
});

type Step = "find" | "amount" | "review" | "success";

function SendPage() {
  const [step, setStep] = useState<Step>("find");
  const [query, setQuery] = useState("");
  const [recipient, setRecipient] = useState<{ name: string; handle: string; color: string } | null>(null);
  const [amount, setAmount] = useState("");

  const resolved = useMemo(() => {
    if (!query.trim()) return null;
    const q = query.trim().toLowerCase();
    const match = recents.find((r) => r.handle.toLowerCase().includes(q) || r.name.toLowerCase().includes(q));
    if (match) return match;
    return { name: query.startsWith("@") ? query.slice(1) : query, handle: query.startsWith("@") ? query : `@${q.replace(/\s+/g, "")}`, color: "#0a1a3a" };
  }, [query]);

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
              {fmtNGN(Number(amount || 0))} to {recipient?.handle}
            </div>
          </div>
          <button
            className="tap mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            onClick={() => {
              setStep("find");
              setRecipient(null);
              setAmount("");
              setQuery("");
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
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Username, email, phone or business"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            />
          </label>

          {query && resolved && (
            <button
              className="tap surface-card flex items-center gap-3 px-3 py-3"
              onClick={() => {
                setRecipient(resolved);
                setStep("amount");
              }}
            >
              <Avatar name={resolved.name} color={resolved.color} size={44} />
              <div className="min-w-0 flex-1 text-left">
                <div className="flex items-center gap-1.5 text-sm font-semibold">
                  {resolved.name} <CheckCircle2 className="h-3.5 w-3.5 text-success" />
                </div>
                <div className="text-xs text-muted-foreground">{resolved.handle}</div>
              </div>
              <span className="chip"><ShieldCheck className="h-3 w-3 text-success" /> ALIA</span>
            </button>
          )}

          <div>
            <SectionTitle>Recent</SectionTitle>
            <div className="surface-card divide-y divide-border">
              {recents.map((r) => (
                <button
                  key={r.handle}
                  className="tap flex w-full items-center gap-3 px-3 py-3 text-left first:rounded-t-2xl last:rounded-b-2xl"
                  onClick={() => {
                    setRecipient(r);
                    setStep("amount");
                  }}
                >
                  <Avatar name={r.name} color={r.color} size={40} />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium">{r.name}</div>
                    <div className="text-xs text-muted-foreground">{r.handle}</div>
                  </div>
                  <CheckCircle2 className="h-4 w-4 text-success" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {step === "amount" && recipient && (
        <>
          <div className="surface-card flex items-center gap-3 px-3 py-3">
            <Avatar name={recipient.name} color={recipient.color} size={44} />
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold">{recipient.name}</div>
              <div className="text-xs text-muted-foreground">{recipient.handle}</div>
            </div>
            <button className="text-xs text-primary" onClick={() => setStep("find")}>Change</button>
          </div>
          <div className="mt-4 flex flex-col items-center gap-2 py-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">You send</div>
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-semibold text-muted-foreground">₦</span>
              <input
                autoFocus
                inputMode="decimal"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ""))}
                placeholder="0"
                className="w-44 bg-transparent text-center text-5xl font-semibold tracking-tight outline-none placeholder:text-muted-foreground/40"
              />
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
          <button
            disabled={!amount || Number(amount) <= 0}
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
            onClick={() => setStep("review")}
          >
            Continue
          </button>
        </>
      )}

      {step === "review" && recipient && (
        <>
          <div className="surface-card flex flex-col items-center gap-4 px-4 py-6 text-center">
            <Avatar name={recipient.name} color={recipient.color} size={60} />
            <div>
              <div className="text-sm font-medium">Sending to {recipient.name}</div>
              <div className="text-xs text-muted-foreground">{recipient.handle}</div>
            </div>
            <div className="text-3xl font-semibold">{fmtNGN(Number(amount))}</div>
            <span className="chip"><ShieldCheck className="h-3 w-3 text-success" /> Settled by ALIA · Free</span>
          </div>
          <div className="surface-card divide-y divide-border text-sm">
            <Row label="Fee" value="₦0" />
            <Row label="Arrives" value="Instantly" />
            <Row label="Trust check" value="Passed" valueClass="text-success" />
          </div>
          <button
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red"
            onClick={() => setStep("success")}
          >
            Confirm & send
          </button>
        </>
      )}
    </Screen>
  );
}

function Row({ label, value, valueClass = "" }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between px-4 py-3">
      <span className="text-muted-foreground">{label}</span>
      <span className={`font-medium ${valueClass}`}>{value}</span>
    </div>
  );
}
