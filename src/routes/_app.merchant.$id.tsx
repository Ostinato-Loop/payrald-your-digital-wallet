import { createFileRoute, Link, useParams } from "@tanstack/react-router";
import { CheckCircle2, Globe2, ShieldCheck, Star } from "lucide-react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { fmtNGN } from "@/lib/payrald/mock";
import {
  getMerchantByAlias,
  getVoucherProducts,
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
    merchant.trust_score != null
      ? String(merchant.trust_score)
      : "Verified";

  return (
    <Screen title="" back>
      <section
        className="surface-card flex flex-col items-center gap-3 p-6 text-center"
        style={{
          background: `linear-gradient(135deg, color-mix(in oklab, #e11d2a 20%, transparent), oklch(0.08 0 0))`,
        }}
      >
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/20 text-2xl font-bold text-primary">
          {merchant.name[0]}
        </span>
        <div>
          <div className="flex items-center justify-center gap-1.5 text-lg font-semibold">
            {merchant.name}
            {merchant.verified && (
              <CheckCircle2 className="h-4 w-4 text-success" />
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {merchant.alias}
            {merchant.category ? ` · ${merchant.category}` : ""}
          </div>
        </div>
        <div className="mt-1 flex items-center gap-2">
          {merchant.verified && (
            <span className="chip">
              <ShieldCheck className="h-3 w-3 text-success" /> Verified merchant
            </span>
          )}
          <span className="chip">
            <Star className="h-3 w-3 text-mustard" /> Trust {trustStr}
          </span>
        </div>
      </section>

      <div className="grid grid-cols-3 gap-3 text-center">
        <Stat label="Trust" value={trustStr} />
        <Stat
          label="Coverage"
          value="54 countries"
          icon={<Globe2 className="h-3 w-3" />}
        />
        <Stat label="Settlement" value="Instant" />
      </div>

      {products.length > 0 && (
        <>
          <SectionTitle>Buy now</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            {products.slice(0, 4).map((p: VoucherProduct) => (
              <div
                key={p.slug}
                className="surface-card flex flex-col gap-2 p-4"
              >
                <span className="chip">{p.kind ?? p.category ?? "Voucher"}</span>
                <div className="text-sm font-medium leading-tight">{p.name}</div>
                <div className="mt-auto flex items-end justify-between">
                  <div className="text-base font-semibold">
                    {fmtNGN(p.price)}
                  </div>
                  <Link
                    to="/marketplace"
                    className="text-[11px] font-semibold text-primary"
                  >
                    Buy →
                  </Link>
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
  icon,
}: {
  label: string;
  value: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="surface-card px-2 py-3">
      <div className="flex items-center justify-center gap-1 text-[10px] uppercase tracking-wider text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 text-sm font-semibold">{value}</div>
    </div>
  );
}
