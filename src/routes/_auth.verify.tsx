import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { signInWithOtp, verifyOtp } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_auth/verify")({
  head: () => ({ meta: [{ title: "Verify · PayRald" }] }),
  component: Verify,
});

function Verify() {
  const navigate = useNavigate();
  const [code, setCode] = useState<string[]>(Array(6).fill(""));
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [seconds, setSeconds] = useState(45);
  const refs = useRef<Array<HTMLInputElement | null>>([]);

  const pending = (() => {
    try {
      return JSON.parse(sessionStorage.getItem("_pr_pending") ?? "null") as
        | { identity: string; type: "email" | "sms" }
        | null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const t = setInterval(
      () => setSeconds((s) => (s > 0 ? s - 1 : 0)),
      1000,
    );
    return () => clearInterval(t);
  }, []);

  const verify = async (pin: string[]) => {
    if (pin.some((c) => !c)) return;
    setBusy(true);
    setErr(null);
    try {
      const token = pin.join("");
      const type = pending?.type ?? "email";
      const payload =
        type === "sms"
          ? { token, type: "sms" as const, phone: pending?.identity }
          : { token, type: "email" as const, email: pending?.identity };
      await verifyOtp({ data: payload });
      sessionStorage.removeItem("_pr_pending");
      await navigate({ to: "/home" });
    } catch (e: unknown) {
      setErr(
        e instanceof Error
          ? e.message
          : "Invalid code. Please try again.",
      );
      setBusy(false);
    }
  };

  const set = (i: number, v: string) => {
    const ch = v.slice(-1).replace(/[^0-9]/g, "");
    const next = [...code];
    next[i] = ch;
    setCode(next);
    if (ch && i < 5) refs.current[i + 1]?.focus();
    if (ch && i === 5 && next.every((c) => c.length === 1)) {
      void verify(next);
    }
  };

  const back = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[i] && i > 0)
      refs.current[i - 1]?.focus();
  };

  const resend = async () => {
    if (!pending) return;
    setSeconds(45);
    setErr(null);
    try {
      await signInWithOtp({
        data:
          pending.type === "sms"
            ? { phone: pending.identity }
            : { email: pending.identity },
      });
    } catch {
    }
  };

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
      <Link
        to="/signin"
        className="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="mt-8 flex flex-col items-center text-center">
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
          <ShieldCheck className="h-7 w-7" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Verify it's you
        </h1>
        <p className="mt-1 max-w-xs text-sm text-muted-foreground">
          {pending
            ? `We sent a 6-digit code to ${pending.identity}. ALIA will confirm and unlock your wallet.`
            : "We sent a 6-digit code to your contact. ALIA will confirm and unlock your wallet."}
        </p>
      </div>

      <div className="mt-10 flex items-center justify-center gap-2.5">
        {code.map((c, i) => (
          <input
            key={i}
            ref={(el) => {
              refs.current[i] = el;
            }}
            inputMode="numeric"
            maxLength={1}
            value={c}
            onChange={(e) => set(i, e.target.value)}
            onKeyDown={(e) => back(i, e)}
            className="surface-card h-14 w-11 bg-surface text-center text-xl font-semibold outline-none focus:border-primary focus:ring-2 focus:ring-primary/30"
          />
        ))}
      </div>

      {err && (
        <p className="mt-4 rounded-xl bg-destructive/10 px-4 py-2.5 text-center text-xs text-destructive">
          {err}
        </p>
      )}

      <p className="mt-6 text-center text-xs text-muted-foreground">
        {seconds > 0 ? (
          <>
            Resend code in{" "}
            <span className="text-foreground">{seconds}s</span>
          </>
        ) : (
          <button
            onClick={resend}
            className="font-semibold text-primary"
          >
            Resend code
          </button>
        )}
      </p>

      <button
        disabled={busy || code.some((c) => !c)}
        onClick={() => void verify(code)}
        className="tap mt-auto w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
      >
        {busy ? "Unlocking…" : "Verify & continue"}
      </button>
    </div>
  );
}
