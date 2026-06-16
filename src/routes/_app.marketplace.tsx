import { createFileRoute } from "@tanstack/react-router";
import { CheckCircle2, Zap } from "lucide-react";
import { useState } from "react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
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
  const [bought, setBought] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const buy = async (p: VoucherProduct) => {
    setBuying(p.slug);
    setErr(null);
    try {
      await purchaseVoucher({ data: { product_slug: p.slug } });
      setBought(p.name);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Purchase failed. Please try again.");
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
          <div>
            <div className="text-xl font-semibold">Purchased!</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {bought} delivered to your account · ALIA settled the merchant
            </div>
          </div>
          <button
            className="tap mt-4 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground"
            onClick={() => setBought(null)}
          >
            Done
          </button>
        </div>
      </Screen>
    );
  }

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
            <div className="text-xs text-muted-foreground">
              ALIA settles the merchant the moment you pay
            </div>
          </div>
        </div>
      </div>

      {err && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
          {err}
        </p>
      )}

      <SectionTitle>Subscriptions & gift cards</SectionTitle>

      {products.length === 0 ? (
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          No products available right now
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {products.map((p: VoucherProduct) => (
            <button
              key={p.slug}
              disabled={buying === p.slug}
              onClick={() => void buy(p)}
              className="tap surface-card flex flex-col gap-3 p-4 text-left disabled:opacity-60"
            >
              <div className="flex items-center justify-between">
                <span className="chip">{p.kind ?? p.category ?? "Voucher"}</span>
                <span className="text-[10px] text-muted-foreground">
                  {p.vendor}
                </span>
              </div>
              <div className="text-sm font-medium leading-tight">{p.name}</div>
              <div className="mt-auto flex items-end justify-between">
                <div className="text-base font-semibold">
                  {fmtNGN(p.price)}
                </div>
                <span className="text-[10px] font-semibold text-primary">
                  {buying === p.slug ? "Buying…" : "Buy →"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </Screen>
  );
}
