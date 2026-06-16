import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { VendorLogo } from "@/components/payrald/VendorLogo";
import { getMerchants } from "@/lib/payrald/api.server";
import type { MerchantRow } from "@/lib/payrald/api.server";

export const Route = createFileRoute("/_app/pay")({
  head: () => ({ meta: [{ title: "Pay merchants · PayRald" }] }),
  loader: async () => {
    const result = await getMerchants();
    const categories = [
      "All",
      ...Array.from(
        new Set(
          result.data
            .map((m: MerchantRow) => m.category)
            .filter(Boolean) as string[],
        ),
      ),
    ];
    return { merchants: result.data, categories };
  },
  pendingComponent: PaySkeleton,
  pendingMs: 150,
  pendingMinMs: 400,
  component: PayPage,
});

function Bone({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-2xl bg-surface-2 ${className}`} />;
}

function PaySkeleton() {
  return (
    <div className="flex flex-col gap-5 px-5 pb-6 pt-5">
      <div className="flex flex-col gap-1">
        <Bone className="h-7 w-36" />
        <Bone className="h-4 w-52 rounded-xl" />
      </div>
      <Bone className="h-12 rounded-2xl" />
      <div className="flex gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Bone key={i} className="h-8 w-16 rounded-full" />
        ))}
      </div>
      <Bone className="h-20 rounded-2xl" />
      <Bone className="h-4 w-24 rounded-xl" />
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <Bone key={i} className="h-24 rounded-2xl" />
        ))}
      </div>
    </div>
  );
}

function PayPage() {
  const { merchants, categories } = Route.useLoaderData();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const list = useMemo(() => {
    return merchants.filter((m: MerchantRow) => {
      if (cat !== "All" && m.category !== cat) return false;
      if (
        q &&
        !`${m.name} ${m.alias}`.toLowerCase().includes(q.toLowerCase())
      )
        return false;
      return true;
    });
  }, [merchants, q, cat]);

  return (
    <Screen
      title="Pay merchants"
      subtitle="Search by name, handle or category"
      back={false}
    >
      {/* Search */}
      <label className="surface-card flex items-center gap-2 px-4 py-3">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Spotify, OpenAI, your school…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      {/* Category pills */}
      {categories.length > 1 && (
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {categories.map((c: string) => (
            <button
              key={c}
              onClick={() => setCat(c)}
              className={`tap shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                cat === c
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-surface text-muted-foreground"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      )}

      {/* Marketplace CTA */}
      <Link
        to="/marketplace"
        className="tap relative overflow-hidden rounded-2xl border border-border p-4"
        style={{
          background:
            "linear-gradient(120deg, oklch(0.2 0.05 260) 0%, oklch(0.1 0 0) 70%)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-mustard text-mustard-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <div className="text-sm font-semibold">Digital marketplace</div>
            <div className="text-xs text-muted-foreground">
              Gift cards, subscriptions, cloud credits — delivered instantly
            </div>
          </div>
          {/* Mini logo parade */}
          <div className="flex gap-1">
            {["Netflix", "Spotify", "Steam"].map((v) => (
              <VendorLogo key={v} name={v} size={22} rounded="rounded-md" />
            ))}
          </div>
        </div>
      </Link>

      <SectionTitle>Featured</SectionTitle>

      {list.length === 0 ? (
        <div className="surface-card px-4 py-10 text-center text-sm text-muted-foreground">
          No merchants found
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {list.map((m: MerchantRow) => (
            <Link
              key={m.id}
              to="/merchant/$id"
              params={{ id: m.alias }}
              className="tap surface-card flex flex-col items-center gap-2.5 px-2 py-4 text-center"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-border/40 bg-white/5 p-1">
                <VendorLogo name={m.name} size={44} rounded="rounded-xl" />
              </div>
              <div className="w-full">
                <div className="truncate text-xs font-medium">{m.name}</div>
                <div className="truncate text-[10px] text-muted-foreground">
                  {m.alias}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </Screen>
  );
}
