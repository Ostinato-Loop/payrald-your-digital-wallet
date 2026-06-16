import { createFileRoute } from "@tanstack/react-router";
import { Check, Copy, Mail, Phone, Share2, User } from "lucide-react";
import { useState } from "react";
import { Screen } from "@/components/payrald/Screen";
import { me } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/receive")({
  head: () => ({ meta: [{ title: "Receive · PayRald" }] }),
  component: ReceivePage,
});

function ReceivePage() {
  return (
    <Screen title="Receive money" subtitle="Share any of your ALIA identities">
      <div className="surface-card flex flex-col items-center gap-4 px-6 py-8 text-center">
        <FakeQR value={me.handle} />
        <div className="text-lg font-semibold">{me.handle}</div>
        <div className="text-xs text-muted-foreground">{me.name} · Verified</div>
        <button className="tap inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-xs font-semibold text-primary-foreground shadow-glow-red">
          <Share2 className="h-4 w-4" /> Share QR
        </button>
      </div>

      <div className="surface-card divide-y divide-border">
        <CopyRow icon={<User className="h-4 w-4" />} label="Username" value={me.handle} />
        <CopyRow icon={<Mail className="h-4 w-4" />} label="Email" value={me.email} />
        <CopyRow icon={<Phone className="h-4 w-4" />} label="Phone" value={me.phone} />
      </div>

      <p className="px-2 text-center text-xs text-muted-foreground">
        No account numbers required. ALIA routes funds to your wallet automatically.
      </p>
    </Screen>
  );
}

function CopyRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <button
      onClick={() => {
        navigator.clipboard?.writeText(value);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      }}
      className="tap flex w-full items-center gap-3 px-4 py-3 text-left"
    >
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-surface-2 text-muted-foreground">
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className="truncate text-sm font-medium">{value}</div>
      </div>
      {copied ? (
        <Check className="h-4 w-4 text-success" />
      ) : (
        <Copy className="h-4 w-4 text-muted-foreground" />
      )}
    </button>
  );
}

function FakeQR({ value }: { value: string }) {
  // Decorative QR — deterministic dot grid from string
  const size = 21;
  const cells: boolean[] = [];
  let seed = 0;
  for (let i = 0; i < value.length; i++) seed = (seed * 31 + value.charCodeAt(i)) >>> 0;
  for (let i = 0; i < size * size; i++) {
    seed = (seed * 1103515245 + 12345) >>> 0;
    cells.push((seed & 0xff) > 120);
  }
  const corner = (x: number, y: number) =>
    (x < 7 && y < 7) || (x >= size - 7 && y < 7) || (x < 7 && y >= size - 7);

  return (
    <div className="rounded-2xl bg-white p-3">
      <div
        className="grid gap-[2px]"
        style={{ gridTemplateColumns: `repeat(${size}, 8px)` }}
        aria-label={`QR for ${value}`}
      >
        {cells.map((on, i) => {
          const x = i % size;
          const y = Math.floor(i / size);
          const isCorner = corner(x, y);
          const black = isCorner
            ? (x === 0 || x === 6 || y === 0 || y === 6 ||
               (x >= 2 && x <= 4 && y >= 2 && y <= 4) ||
               (x >= size - 7 && (x === size - 7 || x === size - 1 || y === 0 || y === 6 || (x >= size - 5 && x <= size - 3 && y >= 2 && y <= 4))) ||
               (y >= size - 7 && (y === size - 7 || y === size - 1 || x === 0 || x === 6 || (y >= size - 5 && y <= size - 3 && x >= 2 && x <= 4))))
            : on;
          return (
            <span
              key={i}
              className="h-2 w-2 rounded-[1px]"
              style={{ background: black ? "#0a0a0a" : "transparent" }}
            />
          );
        })}
      </div>
    </div>
  );
}
