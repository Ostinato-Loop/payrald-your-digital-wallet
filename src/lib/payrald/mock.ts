export type Identity = {
  handle: string;
  email: string;
  phone: string;
  name: string;
  verified: boolean;
  trustScore: number;
};

export const me: Identity = {
  handle: "@boyd",
  email: "boyd@rald.africa",
  phone: "+234 802 555 0140",
  name: "Boyd Okwuosa",
  verified: true,
  trustScore: 96,
};

export type Tx = {
  id: string;
  kind: "send" | "receive" | "pay" | "withdraw" | "deposit" | "subscription" | "refund";
  party: string;
  partyHandle: string;
  amount: number; // negative = outflow
  currency: "NGN";
  status: "completed" | "pending" | "failed";
  at: string; // ISO
  note?: string;
  category?: string;
};

export const transactions: Tx[] = [
  { id: "t1", kind: "receive", party: "Amaka N.", partyHandle: "@amaka", amount: 25000, currency: "NGN", status: "completed", at: "2026-06-16T09:12:00Z", note: "Lunch split" },
  { id: "t2", kind: "pay", party: "Spotify", partyHandle: "@spotify", amount: -1900, currency: "NGN", status: "completed", at: "2026-06-16T07:02:00Z", category: "Subscription" },
  { id: "t3", kind: "send", party: "Tunde A.", partyHandle: "@tundea", amount: -8000, currency: "NGN", status: "completed", at: "2026-06-15T18:44:00Z", note: "Cab fare" },
  { id: "t4", kind: "deposit", party: "Wallet top-up", partyHandle: "wallet", amount: 150000, currency: "NGN", status: "completed", at: "2026-06-15T11:20:00Z" },
  { id: "t5", kind: "pay", party: "OpenAI", partyHandle: "@openai", amount: -32000, currency: "NGN", status: "pending", at: "2026-06-15T08:01:00Z", category: "AI" },
  { id: "t6", kind: "withdraw", party: "Linked Institution", partyHandle: "@bankrouting", amount: -50000, currency: "NGN", status: "completed", at: "2026-06-14T20:13:00Z" },
  { id: "t7", kind: "receive", party: "Chiamaka O.", partyHandle: "@chiamaka", amount: 12000, currency: "NGN", status: "completed", at: "2026-06-14T13:30:00Z", note: "Drinks" },
  { id: "t8", kind: "pay", party: "Netflix", partyHandle: "@netflix", amount: -4400, currency: "NGN", status: "completed", at: "2026-06-13T19:00:00Z", category: "Entertainment" },
  { id: "t9", kind: "subscription", party: "Canva Pro", partyHandle: "@canva", amount: -5500, currency: "NGN", status: "completed", at: "2026-06-12T09:00:00Z", category: "Design" },
  { id: "t10", kind: "refund", party: "Steam", partyHandle: "@steam", amount: 6800, currency: "NGN", status: "completed", at: "2026-06-11T22:14:00Z" },
];

export const merchants = [
  { id: "spotify", name: "Spotify", handle: "@spotify", category: "Music", trust: 99, color: "#1DB954" },
  { id: "netflix", name: "Netflix", handle: "@netflix", category: "Streaming", trust: 99, color: "#E50914" },
  { id: "openai", name: "OpenAI", handle: "@openai", category: "AI", trust: 98, color: "#10A37F" },
  { id: "canva", name: "Canva", handle: "@canva", category: "Design", trust: 97, color: "#00C4CC" },
  { id: "adobe", name: "Adobe", handle: "@adobe", category: "Creative", trust: 98, color: "#FF0000" },
  { id: "aws", name: "AWS", handle: "@aws", category: "Cloud", trust: 99, color: "#FF9900" },
  { id: "google", name: "Google Play", handle: "@googleplay", category: "Store", trust: 99, color: "#34A853" },
  { id: "apple", name: "Apple", handle: "@apple", category: "Store", trust: 99, color: "#A2AAAD" },
  { id: "steam", name: "Steam", handle: "@steam", category: "Gaming", trust: 97, color: "#1B2838" },
  { id: "xbox", name: "Xbox", handle: "@xbox", category: "Gaming", trust: 97, color: "#107C10" },
  { id: "playstation", name: "PlayStation", handle: "@playstation", category: "Gaming", trust: 97, color: "#003791" },
  { id: "microsoft", name: "Microsoft", handle: "@microsoft", category: "Software", trust: 99, color: "#00A4EF" },
];

export const marketplace = [
  { id: "spotify-3", name: "Spotify Premium · 3 months", price: 5700, vendor: "Spotify", kind: "Subscription" },
  { id: "netflix-1", name: "Netflix Standard · 1 month", price: 4400, vendor: "Netflix", kind: "Subscription" },
  { id: "openai-20", name: "ChatGPT Plus · 1 month", price: 32000, vendor: "OpenAI", kind: "Subscription" },
  { id: "steam-50", name: "Steam Wallet · $50", price: 78000, vendor: "Steam", kind: "Gift card" },
  { id: "psn-25", name: "PSN Card · $25", price: 39500, vendor: "PlayStation", kind: "Gift card" },
  { id: "xbox-25", name: "Xbox Live · $25", price: 39200, vendor: "Xbox", kind: "Gift card" },
  { id: "apple-15", name: "Apple Gift Card · $15", price: 23500, vendor: "Apple", kind: "Gift card" },
  { id: "canva-y", name: "Canva Pro · 1 year", price: 41000, vendor: "Canva", kind: "Subscription" },
];

export const recents = [
  { handle: "@amaka", name: "Amaka N.", color: "#e11d2a" },
  { handle: "@tundea", name: "Tunde A.", color: "#0a1a3a" },
  { handle: "@chiamaka", name: "Chiamaka O.", color: "#d39115" },
  { handle: "@kwame", name: "Kwame B.", color: "#1f6f3f" },
  { handle: "@zola", name: "Zola M.", color: "#5d2a82" },
];

export const fmtNGN = (n: number) =>
  new Intl.NumberFormat("en-NG", { style: "currency", currency: "NGN", maximumFractionDigits: 0 }).format(n);

export const fmtRel = (iso: string) => {
  const d = new Date(iso);
  const diff = (Date.now() - d.getTime()) / 1000;
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}d ago`;
  return d.toLocaleDateString("en-NG", { month: "short", day: "numeric" });
};
