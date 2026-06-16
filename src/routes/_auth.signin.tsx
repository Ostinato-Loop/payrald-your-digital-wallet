import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AtSign, Eye, EyeOff, Fingerprint, Lock } from "lucide-react";
import { useState } from "react";
import { signInWithOtp, signInWithPassword } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_auth/signin")({
  head: () => ({ meta: [{ title: "Sign in · PayRald" }] }),
  component: SignIn,
});

function SignIn() {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const isEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const submitPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !pw) return;
    setLoading(true);
    setErr(null);
    try {
      const identity = id.trim();
      const email = isEmail(identity) ? identity : undefined;
      if (!email) {
        setErr("Please enter a valid email address to sign in with password.");
        setLoading(false);
        return;
      }
      await signInWithPassword({ data: { email, password: pw } });
      await navigate({ to: "/home" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Sign in failed. Please check your credentials.");
    } finally {
      setLoading(false);
    }
  };

  const submitOtp = async () => {
    if (!id) return;
    setLoading(true);
    setErr(null);
    try {
      const identity = id.trim();
      const isPhone = /^\+?[\d\s\-]{7,}$/.test(identity) && !isEmail(identity);
      sessionStorage.setItem("_pr_pending", JSON.stringify({ identity, type: isPhone ? "sms" : "email" }));
      await signInWithOtp({
        data: isPhone ? { phone: identity } : { email: identity },
      });
      await navigate({ to: "/verify" });
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Failed to send OTP. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-1 flex-col px-6 pb-8 pt-4">
      <Link
        to="/welcome"
        className="tap flex h-10 w-10 items-center justify-center rounded-full bg-surface"
        aria-label="Back"
      >
        <ArrowLeft className="h-5 w-5" />
      </Link>

      <div className="mt-6">
        <h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Sign in with your PayRald handle, email or phone.
        </p>
      </div>

      <form onSubmit={submitPassword} className="mt-7 flex flex-col gap-3">
        <Field
          icon={<AtSign className="h-4 w-4" />}
          label="Identity"
          value={id}
          onChange={setId}
          placeholder="@username, email or phone"
          autoFocus
        />
        <Field
          icon={<Lock className="h-4 w-4" />}
          label="Password"
          value={pw}
          onChange={setPw}
          placeholder="Enter password"
          type={show ? "text" : "password"}
          rightSlot={
            <button
              type="button"
              onClick={() => setShow((v) => !v)}
              className="tap text-muted-foreground"
              aria-label="Toggle password"
            >
              {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          }
        />

        {err && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
            {err}
          </p>
        )}

        <div className="flex items-center justify-between text-xs">
          <label className="flex items-center gap-2 text-muted-foreground">
            <input
              type="checkbox"
              defaultChecked
              className="h-3.5 w-3.5 accent-[color:var(--primary)]"
            />
            Trust this device
          </label>
          <button type="button" className="text-primary">
            Forgot password?
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || !id || !pw}
          className="tap mt-2 w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
        >
          {loading ? "Verifying…" : "Sign in"}
        </button>

        <button
          type="button"
          disabled={loading || !id}
          onClick={submitOtp}
          className="tap flex w-full items-center justify-center gap-2 rounded-full border border-border bg-surface py-3.5 text-sm font-semibold disabled:opacity-40"
        >
          <Fingerprint className="h-4 w-4 text-primary" /> Use OTP / biometric
        </button>
      </form>

      <div className="my-6 flex items-center gap-3 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        <span className="h-px flex-1 bg-border" />
        Or continue with
        <span className="h-px flex-1 bg-border" />
      </div>

      <div className="grid grid-cols-3 gap-2">
        <Social label="Apple" />
        <Social label="Google" />
        <Social label="ALIA" highlight />
      </div>

      <p className="mt-auto pt-8 text-center text-xs text-muted-foreground">
        New to PayRald?{" "}
        <Link to="/signup" className="font-semibold text-primary">
          Create an account
        </Link>
      </p>
    </div>
  );
}

function Field({
  icon,
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  rightSlot,
  autoFocus,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  rightSlot?: React.ReactNode;
  autoFocus?: boolean;
}) {
  return (
    <label className="surface-card flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        <input
          autoFocus={autoFocus}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
        />
      </div>
      {rightSlot}
    </label>
  );
}

function Social({ label, highlight }: { label: string; highlight?: boolean }) {
  return (
    <button
      type="button"
      className={`tap rounded-2xl border px-3 py-3 text-xs font-semibold ${
        highlight
          ? "border-primary/40 bg-primary/10 text-primary"
          : "border-border bg-surface text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
