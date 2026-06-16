import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { VendorLogo } from "@/components/payrald/VendorLogo";
import { fmtNGN } from "@/lib/payrald/mock";
import { getVoucherProducts, purchaseVoucher } from "@/lib/payrald/api.server";
import type { VoucherProduct } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/marketplace")({
  head: () => ({ meta: [{ title: "Marketplace · PayRald" }] }),
  loader: async () => {
    const result = await getVoucherProducts();
    return { products: result.data };
  },
  component: MarketPage,
});

function MarketPage() {
  const { products } = Route.useLoaderData();
  const [buying, setBuying] = useState<string | null>(null);
  const [bought, setBought] = useState<VoucherProduct | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [filter, setFilter] = useState("All");

  const vendors = ["All", ...Array.from(new Set(products.map((p) => p.vendor)))];
  const list = filter === "All" ? products : products.filter((p) => p.vendor === filter);

  const buy = async (p: VoucherProduct) => {
    setBuying(p.slug);
    setErr(null);
    try {
      await purchaseVoucher({ data: { product_slug: p.slug } });
      setBought(p);
    } catch (e: unknown) {
      setErr(
        e instanceof Error ? e.message : "Purchase failed. Please try again.",
      );
    } finally {
      setBuying(null);
    }
  };

  if (bought) {
    return (
      <Screen back={false} title="" className="items-center pt-16 text-center">
        <div className="mx-auto flex flex-col items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <VendorLogo name={bought.vendor} size={52} rounded="rounded-2xl" />
          <div>
            <div className="text-xl font-semibold">Purchased!</div>
            <div className="mt-1 text-sm text-muted-foreground">
              <span className="font-medium">{bought.name}</span> from{" "}
              {bought.vendor} delivered to your account
            </div>
          </div>
          <div className="chip mt-1">
            <ShieldCheck className="h-3 w-3 text-success" /> ALIA settled the
            merchant instantly
          </div>
          <button
            className="tap mt-2 rounded-full bg-primary px-8 py-3.5 text-sm font-semibold text-primary-foreground shadow-glow-red"
            onClick={() => setBought(null)}
          >
            Done
          </button>
        </div>
      </Screen>
    );
  }

  return (
    <Screen title="Marketplace" subtitle="Instant delivery across Africa">
      {/* Hero banner */}
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
            <div className="text-xs text-muted-foreground">
              ALIA settles the merchant the moment you tap Buy
            </div>
          </div>
        </div>
        {/* Floating logos */}
        <div className="pointer-events-none absolute right-4 top-1/2 flex -translate-y-1/2 gap-1.5 opacity-60">
          {["Netflix", "Spotify", "OpenAI"].map((v) => (
            <VendorLogo key={v} name={v} size={28} rounded="rounded-lg" />
          ))}
        </div>
      </div>

      {err && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
          {err}
        </p>
      )}

      {/* Vendor filter pills */}
      {vendors.length > 1 && (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {vendors.map((v) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`tap flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium ${
                filter === v
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {v !== "All" && (
                <VendorLogo name={v} size={16} rounded="rounded-sm" />
              )}
              {v}
            </button>
          ))}
        </div>
      )}

      <SectionTitle>Subscriptions & gift cards</SectionTitle>

      {list.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          No products available right now
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {list.map((p: VoucherProduct) => (
            <button
              key={p.slug}
              disabled={buying === p.slug}
              onClick={() => void buy(p)}
              className="tap surface-card group flex flex-col gap-3 p-4 text-left disabled:opacity-60"
            >
              {/* Vendor identity */}
              <div className="flex items-center gap-2">
                <VendorLogo name={p.vendor} size={36} rounded="rounded-xl" />
                <div className="min-w-0">
                  <div className="truncate text-[11px] font-semibold">
                    {p.vendor}
                  </div>
                  <span className="chip text-[9px]">
                    {p.kind ?? p.category ?? "Voucher"}
                  </span>
                </div>
              </div>

              {/* Product name */}
              <div className="text-sm font-medium leading-tight">{p.name}</div>

              {/* Price + CTA */}
              <div className="mt-auto flex items-center justify-between">
                <div className="text-base font-semibold">{fmtNGN(p.price)}</div>
                <span
                  className={`rounded-full px-2.5 py-1 text-[10px] font-semibold ${
                    buying === p.slug
                      ? "bg-surface-2 text-muted-foreground"
                      : "bg-primary/15 text-primary group-active:bg-primary group-active:text-primary-foreground"
                  }`}
                >
                  {buying === p.slug ? "Buying…" : "Buy"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
