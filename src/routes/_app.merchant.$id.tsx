import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Globe2, ShieldCheck, Star } from "lucide-react";
import { useState } from "react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { VendorLogo } from "@/components/payrald/VendorLogo";
import { fmtNGN } from "@/lib/payrald/mock";
import {
  getMerchantByAlias,
  getVoucherProducts,
  purchaseVoucher,
} from "@/lib/payrald/api.server";
import type { VoucherProduct } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/merchant/$id")({
  head: () => ({ meta: [{ title: "Merchant · PayRald" }] }),
  loader: async ({ params }) => {
    const [merchant, productsResult] = await Promise.all([
      getMerchantByAlias({ data: { alias: params.id } }),
      getVoucherProducts(),
    ]);
    const products = merchant
      ? productsResult.data.filter(
          (p: VoucherProduct) =>
            p.vendor.toLowerCase() === merchant.name.toLowerCase(),
        )
      : [];
    return { merchant, products };
  },
  component: MerchantPage,
});

function MerchantPage() {
  const { id } = useParams({ from: "/_app/merchant/$id" });
  const { merchant, products } = Route.useLoaderData();
  const [buying, setBuying] = useState<string | null>(null);
  const [bought, setBought] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!merchant) {
    return (
      <Screen title="" back>
        <div className="surface-card px-4 py-8 text-center text-sm text-muted-foreground">
          Merchant not found
        </div>
      </Screen>
    );
  }

  const trustStr =
    merchant.trust_score != null ? String(merchant.trust_score) : "Verified";

  const buy = async (p: VoucherProduct) => {
    setBuying(p.slug);
    setErr(null);
    try {
      await purchaseVoucher({ data: { product_slug: p.slug } });
      setBought(p.name);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : "Purchase failed.");
    } finally {
      setBuying(null);
    }
  };

  if (bought) {
    return (
      <Screen back title="">
        <div className="flex flex-col items-center gap-5 pt-16 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-success/15 text-success">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <div>
            <div className="text-xl font-semibold">Purchased!</div>
            <div className="mt-1 text-sm text-muted-foreground">
              {bought} delivered instantly to your account
            </div>
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
    <Screen title="" back>
      {/* Hero with real logo */}
      <section
        className="surface-card flex flex-col items-center gap-4 overflow-hidden p-6 text-center"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, #e11d2a 15%, transparent), oklch(0.08 0 0))`,
        }}
      >
        {/* Large logo with ring */}
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl border border-border/30 bg-white/8 p-2 shadow-lg backdrop-blur-sm">
          <VendorLogo name={merchant.name} size={60} rounded="rounded-2xl" />
        </div>

        <div>
          <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
            {merchant.name}
            {merchant.verified && (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
          </div>
          <div className="mt-0.5 text-xs text-muted-foreground">
            {merchant.alias}
            {merchant.category ? ` · ${merchant.category}` : ""}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {merchant.verified && (
            <span className="chip">
              <ShieldCheck className="h-3 w-3 text-success" /> Verified
            </span>
          )}
          <span className="chip">
            <Star className="h-3 w-3 text-mustard" /> Trust {trustStr}
          </span>
          <span className="chip">
            <Globe2 className="h-3 w-3" /> 54 countries
          </span>
        </div>
      </section>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Settlement" value="Instant" />
        <Stat label="Trust score" value={trustStr} />
        <Stat label="Network" value="ALIA" />
      </div>

      {/* Description */}
      {merchant.description && (
        <p className="px-1 text-xs text-muted-foreground">
          {merchant.description}
        </p>
      )}

      {err && (
        <p className="rounded-xl bg-destructive/10 px-4 py-2.5 text-xs text-destructive">
          {err}
        </p>
      )}

      {/* Products from this merchant */}
      {products.length > 0 && (
        <>
          <SectionTitle>Buy now</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 6).map((p: VoucherProduct) => (
              <button
                key={p.slug}
                disabled={buying === p.slug}
                onClick={() => void buy(p)}
                className="tap surface-card group flex flex-col gap-2.5 p-4 text-left disabled:opacity-60"
              >
                <div className="flex items-center gap-2">
                  <VendorLogo name={p.vendor} size={28} rounded="rounded-lg" />
                  <span className="chip text-[9px]">
                    {p.kind ?? p.category ?? "Voucher"}
                  </span>
                </div>
                <div className="text-sm font-medium leading-tight">{p.name}</div>
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-base font-semibold">
                    {fmtNGN(p.price)}
                  </div>
                  <span className="rounded-full bg-primary/15 px-2.5 py-1 text-[10px] font-semibold text-primary group-active:bg-primary group-active:text-primary-foreground">
                    {buying === p.slug ? "…" : "Buy"}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </>
      )}

      {/* Custom amount pay */}
      <SectionTitle>Pay this merchant</SectionTitle>
      <Link
        to="/send"
        className="tap surface-card flex items-center gap-3 p-4"
      >
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-border/40 bg-white/5 p-1">
          <VendorLogo name={merchant.name} size={34} rounded="rounded-xl" />
        </div>
        <div className="flex-1">
          <div className="text-sm font-medium">Custom amount</div>
          <div className="text-xs text-muted-foreground">
            Send any amount to {merchant.alias}
          </div>
        </div>
        <span className="text-sm font-semibold text-primary">Pay →</span>
      </Link>
    </Screen>
  );
}

function Stat({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="surface-card px-2 py-3">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
