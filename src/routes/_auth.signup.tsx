import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, AtSign, Mail, Phone, User } from "lucide-react";
import { useState } from "react";
import { signUp } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_auth/signup")({
  head: () => ({ meta: [{ title: "Create account · PayRald" }] }),
  component: SignUp,
});

function SignUp() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    handle: "",
    email: "",
    phone: "",
  });
  const [agree, setAgree] = useState(true);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const valid = form.name && form.handle && form.email && form.phone && agree;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!valid) return;
    setLoading(true);
    setErr(null);
    try {
      sessionStorage.setItem(
        "_pr_pending",
        JSON.stringify({ identity: form.email, type: "email" }),
      );
      await signUp({ data: form });
      await navigate({ to: "/verify" });
    } catch (e: unknown) {
      setErr(
        e instanceof Error ? e.message : "Sign up failed. Please try again.",
      );
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
        <h1 className="text-2xl font-semibold tracking-tight">
          Create your PayRald
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Claim your @handle. ALIA will resolve it everywhere money moves.
        </p>
      </div>

      <form onSubmit={submit} className="mt-7 flex flex-col gap-3">
        <Field
          icon={<User className="h-4 w-4" />}
          label="Full name"
          value={form.name}
          onChange={(v) => setForm({ ...form, name: v })}
          placeholder="Boyd Okwuosa"
          autoFocus
        />
        <Field
          icon={<AtSign className="h-4 w-4" />}
          label="Username"
          value={form.handle}
          onChange={(v) =>
            setForm({
              ...form,
              handle: v.replace(/[^a-z0-9_]/gi, "").toLowerCase(),
            })
          }
          placeholder="boyd"
          prefix="@"
        />
        <Field
          icon={<Mail className="h-4 w-4" />}
          label="Email"
          value={form.email}
          onChange={(v) => setForm({ ...form, email: v })}
          placeholder="you@rald.africa"
          type="email"
        />
        <Field
          icon={<Phone className="h-4 w-4" />}
          label="Phone"
          value={form.phone}
          onChange={(v) => setForm({ ...form, phone: v })}
          placeholder="+234 ..."
          type="tel"
        />

        {err && (
          <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
            {err}
          </p>
        )}

        <label className="mt-1 flex items-start gap-2 text-xs text-muted-foreground">
          <input
            type="checkbox"
            checked={agree}
            onChange={(e) => setAgree(e.target.checked)}
            className="mt-0.5 h-3.5 w-3.5 accent-[color:var(--primary)]"
          />
          <span>
            I agree to PayRald's{" "}
            <span className="text-primary">Terms</span> and{" "}
            <span className="text-primary">Privacy Policy</span>. ALIA may
            verify my identity.
          </span>
        </label>

        <button
          type="submit"
          disabled={!valid || loading}
          className="tap mt-3 w-full rounded-full bg-primary py-4 text-sm font-semibold text-primary-foreground shadow-glow-red disabled:opacity-40"
        >
          {loading ? "Creating…" : "Create account"}
        </button>
      </form>

      <p className="mt-auto pt-8 text-center text-xs text-muted-foreground">
        Already have one?{" "}
        <Link to="/signin" className="font-semibold text-primary">
          Sign in
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
  prefix,
  autoFocus,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
  prefix?: string;
  autoFocus?: boolean;
}) {
  return (
    <label className="surface-card flex items-center gap-3 px-4 py-3">
      <span className="text-muted-foreground">{icon}</span>
      <div className="flex-1">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </div>
        <div className="flex items-center">
          {prefix && (
            <span className="mr-1 text-sm text-muted-foreground">{prefix}</span>
          )}
          <input
            autoFocus={autoFocus}
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground/60"
          />
        </div>
      </div>
    </label>
  );
}
