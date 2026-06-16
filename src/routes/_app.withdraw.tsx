import { createFileRoute } from "@tanstack/react-router";
import { Building2, CheckCircle2, ChevronDown } from "lucide-react";
import { useState } from "react";
import { Screen } from "@/components/payrald/Screen";
import { fmtNGN } from "@/lib/payrald/mock";
import {
  getBanks,
  getWallet,
  initiateWithdrawal,
  verifyBankAccount,
} from "@/lib/payrald/api.server";
import type { BankRow } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/withdraw")({
  head: () => ({ meta: [{ title: "Withdraw · PayRald" }] }),
  loader: async () => {
    const [banksResult, walletResult] = await Promise.all([
      getBanks(),
      getWallet(),
    ]);
    return {
      banks: banksResult.data,
      wallet: walletResult.data,
    };
  },
  component: WithdrawPage,
});

type Step = "form" | "verify" | "success";

function WithdrawPage() {
  const { banks, wallet } = Route.useLoaderData();
  const [step, setStep] = useState<Step>("form");
  const [bankCode, setBankCode] = useState("");
  const [accountNo, setAccountNo] = useState("");
  const [accountName, setAccountName] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [showBanks, setShowBanks] = useState(false);

  const balance = wallet?.balance ?? 0;
  const selectedBank = banks.find((b: BankRow) => b.code === bankCode);

  const verifyAccount = async () => {
    if (!bankCode || accountNo.length < 10) return;
    setVerifying(true);
    setErr(null);
    setAccountName(null);
    try {
      const result = await verifyBankAccount({
        data: { account_number: accountNo, bank_code: bankCode },
      });
      setAccountName(result.account_name);
      setStep("verify");
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? e.message
          : "Could not verify account. Please check the details.",
      );
    } finally {
      setVerifying(false);
    }
  };

  const submit = async () => {
    if (!amount || Number(amount) <= 0 || !bankCode || !accountNo) return;
    setSending(true);
    setErr(null);
    try {
      await initiateWithdrawal({
        data: {
          amount: Number(amount),
          bank_code: bankCode,
          account_number: accountNo,
          account_name: accountName ?? undefined,
        },
      });
      setStep("success");
    } catch (e: unknown) {
      setErr(
        e instanceof Error ? e.message : "Withdrawal failed. Please try again.",
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
            <div className="text-xl font-semibold">Withdrawal sent</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {fmtNGN(Number(amount))} to {selectedBank?.name ?? bankCode} ·
              ALIA is routing the payout
            </div>
          </div>
          <button
            className="tap mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            onClick={() => {
              setStep("form");
              setAmount("");
              setAccountNo("");
              setBankCode("");
              setAccountName(null);
            }}
          >
            Done
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Withdraw" subtitle="ALIA picks the fastest rail">
      <div className="surface-card divide-y divide-border">
        <div className="px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Bank
          </div>
          <button
            onClick={() => setShowBanks((v) => !v)}
            className="mt-1 flex w-full items-center justify-between text-sm"
          >
            <span
              className={selectedBank ? "text-foreground" : "text-muted-foreground"}
            >
              {selectedBank?.name ?? "Select a bank…"}
            </span>
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
          {showBanks && (
            <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-border bg-surface">
              {banks.map((b: BankRow) => (
                <button
                  key={b.code}
                  onClick={() => {
                    setBankCode(b.code);
                    setShowBanks(false);
                    setAccountName(null);
                    if (step === "verify") setStep("form");
                  }}
                  className="tap flex w-full items-center px-3 py-2.5 text-left text-sm hover:bg-surface-2"
                >
                  {b.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-4 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Account number
          </div>
          <input
            inputMode="numeric"
            maxLength={10}
            value={accountNo}
            onChange={(e) => {
              setAccountNo(e.target.value.replace(/\D/g, ""));
              setAccountName(null);
              if (step === "verify") setStep("form");
            }}
            placeholder="0123456789"
            className="mt-1 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
          {accountName && (
            <div className="mt-1 text-xs font-medium text-success">
              {accountName}
            </div>
          )}
        </div>
      </div>

      {err && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
          {err}
        </p>
      )}

      {step === "form" && (
        <button
          disabled={!bankCode || accountNo.length < 10 || verifying}
          onClick={verifyAccount}
          className="tap w-full rounded-full bg-surface border border-border py-4 text-sm font-semibold disabled:opacity-40"
        >
          {verifying ? "Verifying…" : "Verify account"}
        </button>
      )}

      {step === "verify" && accountName && (
        <>
          <div className="flex flex-col items-center gap-2 py-6">
            <div className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
              Amount
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
          </div>
          <button
            disabled={!amount || Number(amount) <= 0 || sending}
            onClick={submit}
            className="tap w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
          >
            {sending ? "Processing…" : "Confirm withdrawal"}
          </button>
        </>
      )}
    </Screen>
  );
}
