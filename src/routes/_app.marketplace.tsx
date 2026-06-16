import { createFileRoute } from "@tanstack/react-router";
import { Zap } from "lucide-react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { fmtNGN, marketplace } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace · PayRald" }] }),
  component: MarketPage,
});

function MarketPage() {
  return (
    <Screen title="Digital marketplace" subtitle="Instant delivery across Africa">
      <div
        className="relative overflow-hidden rounded-3xl border border-border p-5"
        style={{
          background:
            "linear-gradient(135deg, oklch(0.22 0.08 70) 0%, oklch(0.1 0 0) 65%)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mustard text-mustard-foreground">
            <Zap className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Delivered in seconds</div>
            <div className="text-xs text-muted-foreground">ALIA settles the merchant the moment you pay</div>
          </div>
        </div>
      </div>

      <SectionTitle>Subscriptions & gift cards</SectionTitle>
      <div className="grid grid-cols-2 gap-3">
        {marketplace.map((p) => (
          <button
            key={p.id}
            className="tap surface-card flex flex-col gap-3 p-4 text-left"
          >
            <div className="flex items-center justify-between">
              <span className="chip">{p.kind}</span>
              <span className="text-[10px] text-muted-foreground">{p.vendor}</span>
            </div>
            <div className="text-sm font-medium leading-tight">{p.name}</div>
            <div className="mt-auto flex items-end justify-between">
              <div className="text-base font-semibold">{fmtNGN(p.price)}</div>
              <span className="text-[10px] font-semibold text-primary">Buy →</span>
            </div>
          </button>
        ))}
      </div>
    </Screen>
  );
}
