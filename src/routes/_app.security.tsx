import { createFileRoute } from "@tanstack/react-router";
import { Fingerprint, Key, LogOut, Monitor, ShieldCheck, Smartphone } from "lucide-react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { me } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/security")({
  head: () => ({ meta: [{ title: "Security · PayRald" }] }),
  component: SecurityPage,
});

function SecurityPage() {
  return (
    <Screen title="Security center" subtitle="Manage trust, devices and permissions">
      <div
        className="surface-card flex items-center gap-4 p-4"
        style={{ background: "linear-gradient(120deg, oklch(0.16 0.05 150), oklch(0.08 0 0))" }}
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success/20 text-success">
          <ShieldCheck className="h-6 w-6" />
        </span>
        <div className="flex-1">
          <div className="text-sm font-semibold">Trust score · {me.trustScore}</div>
          <div className="text-xs text-muted-foreground">Verified identity · ALIA monitored</div>
        </div>
      </div>

      <SectionTitle>Sign-in</SectionTitle>
      <div className="surface-card divide-y divide-border">
        <Toggle icon={<Fingerprint className="h-4 w-4" />} title="Biometric login" enabled />
        <Toggle icon={<Key className="h-4 w-4" />} title="Passkeys" enabled />
        <Toggle icon={<Smartphone className="h-4 w-4" />} title="2-factor (SMS)" enabled={false} />
      </div>

      <SectionTitle>Devices</SectionTitle>
      <div className="surface-card divide-y divide-border">
        <Device icon={<Smartphone className="h-4 w-4" />} name="iPhone 15 · Lagos" status="This device" />
        <Device icon={<Monitor className="h-4 w-4" />} name="MacBook Pro · Abuja" status="Trusted · 2d ago" />
        <Device icon={<Smartphone className="h-4 w-4" />} name="Pixel 7 · Accra" status="Last seen 9d ago" />
      </div>

      <SectionTitle>ALIA permissions</SectionTitle>
      <div className="surface-card divide-y divide-border">
        <Toggle icon={<ShieldCheck className="h-4 w-4" />} title="Resolve identity for senders" enabled />
        <Toggle icon={<ShieldCheck className="h-4 w-4" />} title="Auto-approve trusted merchants" enabled={false} />
      </div>

      <button className="tap mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-surface px-5 py-3 text-sm font-semibold text-destructive">
        <LogOut className="h-4 w-4" /> Sign out of all devices
      </button>
    </Screen>
  );
}

function Toggle({ icon, title, enabled }: { icon: React.ReactNode; title: string; enabled: boolean }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
        {icon}
      </span>
      <div className="flex-1 text-sm font-medium">{title}</div>
      <span
        className={`relative h-6 w-10 rounded-full transition-colors ${enabled ? "bg-success" : "bg-surface-2"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow-sm transition-all ${
            enabled ? "left-[18px]" : "left-0.5"
          }`}
        />
      </span>
    </div>
  );
}

function Device({ icon, name, status }: { icon: React.ReactNode; name: string; status: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-3">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
        {icon}
      </span>
      <div className="flex-1">
        <div className="text-sm font-medium">{name}</div>
        <div className="text-xs text-muted-foreground">{status}</div>
      </div>
    </div>
  );
}
