import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { Screen } from "@/components/payrald/Screen";
import { fmtNGN } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw · PayRald" }] }),
  component: WithdrawPage,
});

const institutions = [
  { id: "gtb", name: "GTBank", subtitle: "Linked · default", color: "#e85a14" },
  { id: "kuda", name: "Kuda", subtitle: "Linked", color: "#40196d" },
  { id: "opay", name: "OPay", subtitle: "Linked", color: "#1a8917" },
];

type Step = "select" | "amount" | "success";

function WithdrawPage() {
  const [step, setStep] = useState<Step>("select");
  const [inst, setInst] = useState(institutions[0]);
  const [amount, setAmount] = useState("");

  if (step === "success")
    return (
      <Screen back={false} title="" className="items-center pt-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <div className="text-xl font-semibold">Withdrawal sent</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {fmtNGN(Number(amount || 0))} to {inst.name} · ALIA is routing the payout
            </div>
          </div>
          <button
            className="tap mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            onClick={() => {
              setStep("select");
              setAmount("");
            }}
          >
            Done
          </button>
        </div>
      </Screen>
    );

  return (
    <Screen title="Withdraw" subtitle="ALIA picks the fastest rail">
      {step === "select" && (
        <div className="surface-card divide-y divide-border">
          {institutions.map((i) => (
            <button
              key={i.id}
              onClick={() => {
                setInst(i);
                setStep("amount");
              }}
              className="tap flex w-full items-center gap-3 px-4 py-3 text-left"
            >
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ background: i.color }}
              >
                {i.name[0]}
              </span>
              <div className="flex-1">
                <div className="text-sm font-medium">{i.name}</div>
                <div className="text-xs text-muted-foreground">{i.subtitle}</div>
              </div>
              <span className="text-xs text-primary">Use</span>
            </button>
          ))}
          <button className="tap flex w-full items-center gap-3 px-4 py-3 text-left text-muted-foreground">
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-surface-2">
              <Building2 className="h-4 w-4" />
            </span>
            <div className="flex-1 text-sm">Link new institution</div>
            <span className="text-xs text-primary">Add</span>
          </button>
        </div>
      )}

      {step === "amount" && (
        <>
          <div className="surface-card flex items-center gap-3 px-4 py-3">
            <span
              className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white"
              style={{ background: inst.color }}
            >
              {inst.name[0]}
            </span>
            <div className="flex-1">
              <div className="text-sm font-medium">Withdraw to {inst.name}</div>
              <div className="text-xs text-muted-foreground">Routed by ALIA · Instant</div>
            </div>
            <button onClick={() => setStep("select")} className="text-xs text-primary">Change</button>
          </div>

          <div className="flex flex-col items-center gap-2 py-8">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">Amount</div>
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
            <div className="text-[11px] text-muted-foreground">Available ₦482,350</div>
          </div>

          <button
            disabled={!amount || Number(amount) <= 0}
            onClick={() => setStep("success")}
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
          >
            Confirm withdrawal
          </button>
        </>
      )}
    </Screen>
  );
}
