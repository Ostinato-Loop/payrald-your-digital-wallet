import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Globe2, ShieldCheck, Star } from "lucide-react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { fmtNGN, marketplace, merchants } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/merchant/$id")({
  head: () => ({ meta: [{ title: "Merchant · PayRald" }] }),
  component: MerchantPage,
});

function MerchantPage() {
  const { id } = useParams({ from: "/_app/merchant/$id" });
  const m = merchants.find((x) => x.id === id) ?? merchants[0];
  const products = marketplace.filter((p) => p.vendor.toLowerCase() === m.name.toLowerCase()).slice(0, 4);

  return (
    <Screen title="" back>
      <section
        className="surface-card flex flex-col items-center gap-3 p-6 text-center"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, ${m.color} 35%, transparent), oklch(0.08 0 0))`,
        }}
      >
        <span
          className="flex h-16 w-16 items-center justify-center rounded-2xl text-2xl font-bold text-white"
          style={{ background: m.color }}
        >
          {m.name[0]}
        </span>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
            {m.name} <CheckCircle2 className="h-4 w-4 text-success" />
          </div>
          <div className="text-xs text-muted-foreground">{m.handle} · {m.category}</div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          <span className="chip"><ShieldCheck className="h-3 w-3 text-success" /> Verified merchant</span>
          <span className="chip"><Star className="h-3 w-3 text-mustard" /> Trust {m.trust}</span>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Trust" value={`${m.trust}`} />
        <Stat label="Coverage" value="54 countries" icon={<Globe2 className="h-3 w-3" />} />
        <Stat label="Settlement" value="Instant" />
      </div>

      {products.length > 0 && (
        <>
          <SectionTitle>Buy now</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {products.map((p) => (
              <div key={p.id} className="surface-card flex flex-col gap-2 p-4">
                <span className="chip">{p.kind}</span>
                <div className="text-sm font-medium leading-tight">{p.name}</div>
                <div className="mt-auto flex items-end justify-between">
                  <div className="text-base font-semibold">{fmtNGN(p.price)}</div>
                  <button className="text-[11px] font-semibold text-primary">Buy →</button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      <SectionTitle>Pay this merchant</SectionTitle>
      <Link
        to="/send"
        className="tap surface-card flex items-center justify-between gap-3 p-4"
      >
        <div>
          <div className="text-sm font-medium">Custom amount</div>
          <div className="text-xs text-muted-foreground">Send any amount to {m.handle}</div>
        </div>
        <span className="text-sm font-semibold text-primary">Pay →</span>
      </Link>
    </Screen>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon?: React.ReactNode }) {
  return (
    <div className="surface-card px-2 py-3">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}{label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
