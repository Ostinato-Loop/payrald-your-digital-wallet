import { createFileRoute, Link } from "@tanstack/react-router";
import { Search, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import { Screen, SectionTitle } from "@/components/payrald/Screen";
import { merchants } from "@/lib/payrald/mock";

export const Route = createFileRoute("/_app/pay")({
  head: () => ({ meta: [{ title: "Pay merchants · PayRald" }] }),
  component: PayPage,
});

const categories = ["All", "Streaming", "AI", "Gaming", "Software", "Cloud", "Store"];

function PayPage() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const list = useMemo(() => {
    return merchants.filter((m) => {
      if (cat !== "All" && m.category !== cat) return false;
      if (q && !`${m.name} ${m.handle}`.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, cat]);

  return (
    <Screen title="Pay merchants" subtitle="Search by name, handle or category" back={false}>
      <label className="surface-card flex items-center gap-2 px-4 py-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search Spotify, OpenAI, your school…"
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </label>

      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            className={`tap shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium ${
              cat === c
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-surface text-muted-foreground"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <Link
        to="/marketplace"
        className="tap relative overflow-hidden rounded-2xl border border-border p-4"
        style={{
          background:
            "linear-gradient(120deg, oklch(0.2 0.05 260) 0%, oklch(0.1 0 0) 70%)",
        }}
      >
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-mustard text-mustard-foreground">
            <Sparkles className="h-5 w-5" />
          </span>
          <div>
            <div className="text-sm font-semibold">Digital marketplace</div>
            <div className="text-xs text-muted-foreground">Gift cards, subscriptions, cloud credits — delivered instantly</div>
          </div>
        </div>
      </Link>

      <SectionTitle>Featured</SectionTitle>
      <div className="grid grid-cols-3 gap-3">
        {list.map((m) => (
          <Link
            key={m.id}
            to="/merchant/$id"
            params={{ id: m.id }}
            className="tap surface-card flex flex-col items-center gap-2 px-2 py-4 text-center"
          >
            <span
              className="flex h-12 w-12 items-center justify-center rounded-2xl text-base font-bold text-white"
              style={{ background: m.color }}
            >
              {m.name[0]}
            </span>
            <div className="w-full">
              <div className="truncate text-xs font-medium">{m.name}</div>
              <div className="truncate text-[10px] text-muted-foreground">{m.handle}</div>
            </div>
          </Link>
        ))}
      </div>
    </Screen>
  );
}
