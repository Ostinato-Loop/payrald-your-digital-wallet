import { createServerFn } from "@tanstack/react-start";
import { getCookie, setCookie, deleteCookie } from "vinxi/http";
import { z } from "zod";

const SUPABASE_URL = "https://onxdcikfttdmnhofsuwo.supabase.co";
const PAYRALD_API = "https://pay.rald.cloud";
const COOKIE = "_payrald_jwt";

function getToken(): string | null {
  try {
    return getCookie(COOKIE) ?? null;
  } catch {
    return null;
  }
}

async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const token = getToken();
  return fetch(`${PAYRALD_API}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers as Record<string, string> | undefined ?? {}),
    },
  });
}

function supabaseKey(): string {
  return process.env.SUPABASE_ANON_KEY ?? process.env.VITE_SUPABASE_ANON_KEY ?? "";
}

function setSessionCookie(token: string) {
  setCookie(COOKIE, token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export const getMe = createServerFn({ method: "GET" }).handler(async () => {
  const token = getToken();
  if (!token) return null;
  try {
    const [, body] = token.split(".");
    const payload = JSON.parse(
      atob(body.replace(/-/g, "+").replace(/_/g, "/")),
    ) as Record<string, unknown>;
    if ((payload.exp as number) < Math.floor(Date.now() / 1000)) return null;
    return {
      id: (payload.id ?? payload.sub) as string,
      email: payload.email as string,
      name: (payload.name ??
        (payload.user_metadata as Record<string, unknown> | undefined)?.name ??
        null) as string | null,
      username: (payload.username ??
        (payload.user_metadata as Record<string, unknown> | undefined)
          ?.username ??
        null) as string | null,
      phone: (payload.phone ??
        (payload.user_metadata as Record<string, unknown> | undefined)?.phone ??
        null) as string | null,
      trustScore: (payload.trust_score as number | undefined) ?? 0,
      trustLevel: (payload.trust_level as string | undefined) ?? "unverified",
    };
  } catch {
    return null;
  }
});

export const signInWithPassword = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string(), password: z.string() }))
  .handler(async ({ data }) => {
    const res = await fetch(
      `${SUPABASE_URL}/auth/v1/token?grant_type=password`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: supabaseKey(),
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
      },
    );
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(
        (body?.error_description as string) ??
          (body?.message as string) ??
          "Sign in failed",
      );
    }
    setSessionCookie(body.access_token as string);
    return { ok: true };
  });

export const signInWithOtp = createServerFn({ method: "POST" })
  .inputValidator(z.object({ email: z.string().optional(), phone: z.string().optional() }))
  .handler(async ({ data }) => {
    const payload = data.email
      ? { email: data.email }
      : { phone: data.phone };
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey(),
      },
      body: JSON.stringify({ ...payload, create_user: false }),
    });
    if (!res.ok) {
      const body = (await res.json()) as Record<string, unknown>;
      throw new Error(
        (body?.error_description as string) ??
          (body?.message as string) ??
          "Failed to send OTP",
      );
    }
    return { ok: true };
  });

export const signUp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      email: z.string().email(),
      name: z.string(),
      handle: z.string(),
      phone: z.string(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey(),
      },
      body: JSON.stringify({
        email: data.email,
        create_user: true,
        data: {
          name: data.name,
          username: data.handle,
          phone: data.phone,
          full_name: data.name,
        },
      }),
    });
    if (!res.ok) {
      const body = (await res.json()) as Record<string, unknown>;
      throw new Error(
        (body?.error_description as string) ??
          (body?.message as string) ??
          "Sign up failed",
      );
    }
    return { ok: true };
  });

export const verifyOtp = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      token: z.string().length(6),
      email: z.string().optional(),
      phone: z.string().optional(),
      type: z.enum(["email", "sms"]).default("email"),
    }),
  )
  .handler(async ({ data }) => {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey(),
      },
      body: JSON.stringify({
        token: data.token,
        type: data.type,
        ...(data.email ? { email: data.email } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
      }),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok) {
      throw new Error(
        (body?.error_description as string) ??
          (body?.message as string) ??
          "Verification failed",
      );
    }
    if (body.access_token) {
      setSessionCookie(body.access_token as string);
    }
    return { ok: true };
  });

export const signOut = createServerFn({ method: "POST" }).handler(async () => {
  try {
    deleteCookie(COOKIE, { path: "/" });
  } catch {
    setCookie(COOKIE, "", { maxAge: 0, path: "/" });
  }
  return { ok: true };
});

export const getWallet = createServerFn({ method: "GET" }).handler(async () => {
  const res = await apiFetch("/v1/wallet");
  if (res.status === 401) return { error: "unauthenticated" as const, data: null };
  if (res.status === 404) return { error: "not_found" as const, data: null };
  if (!res.ok) return { error: "failed" as const, data: null };
  return { error: null, data: (await res.json()) as WalletData };
});

export const getTransactions = createServerFn({ method: "GET" })
  .inputValidator(
    z
      .object({
        limit: z.number().optional(),
        cursor: z.string().optional(),
        type: z.string().optional(),
      })
      .optional(),
  )
  .handler(async ({ data }) => {
    const params = new URLSearchParams();
    if (data?.limit) params.set("limit", String(data.limit));
    if (data?.cursor) params.set("cursor", data.cursor);
    if (data?.type) params.set("type", data.type);
    const qs = params.toString();
    const res = await apiFetch(`/v1/wallet/transactions${qs ? "?" + qs : ""}`);
    if (!res.ok) return { data: [] as TxRow[], next_cursor: null };
    return (await res.json()) as { data: TxRow[]; next_cursor: string | null };
  });

export const getBanks = createServerFn({ method: "GET" }).handler(async () => {
  const res = await apiFetch("/v1/banks");
  if (!res.ok) return { data: [] as BankRow[] };
  return (await res.json()) as { data: BankRow[] };
});

export const resolveAlias = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ alias: z.string(), amount: z.number().optional() }),
  )
  .handler(async ({ data }) => {
    const res = await apiFetch("/v1/resolve", {
      method: "POST",
      body: JSON.stringify({
        alias: data.alias,
        amount: data.amount,
        currency: "NGN",
      }),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok)
      return {
        error: (body?.message as string) ?? "Alias not found",
        data: null,
      };
    return { error: null, data: body as ResolvedIdentity };
  });

export const initiateTransfer = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      alias: z.string(),
      amount: z.number(),
      currency: z.string().optional(),
      narration: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await apiFetch("/v1/transfers", {
      method: "POST",
      body: JSON.stringify({
        alias: data.alias,
        amount: data.amount,
        currency: data.currency ?? "NGN",
        narration: data.narration,
      }),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok)
      throw new Error(
        (body?.message as string) ?? (body?.error as string) ?? "Transfer failed",
      );
    return { data: body };
  });

export const initiateWithdrawal = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      amount: z.number(),
      bank_code: z.string(),
      account_number: z.string(),
      account_name: z.string().optional(),
      narration: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await apiFetch("/v1/withdrawals", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok)
      throw new Error(
        (body?.message as string) ?? (body?.error as string) ?? "Withdrawal failed",
      );
    return { data: body };
  });

export const verifyBankAccount = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({ account_number: z.string(), bank_code: z.string() }),
  )
  .handler(async ({ data }) => {
    const res = await apiFetch("/v1/withdrawals/verify-account", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok)
      throw new Error((body?.message as string) ?? "Verification failed");
    return body as { account_name: string; account_number: string };
  });

export const getMerchants = createServerFn({ method: "GET" }).handler(
  async () => {
    const res = await apiFetch("/v1/merchants");
    if (!res.ok) return { data: [] as MerchantRow[] };
    return (await res.json()) as { data: MerchantRow[] };
  },
);

export const getMerchantByAlias = createServerFn({ method: "GET" })
  .inputValidator(z.object({ alias: z.string() }))
  .handler(async ({ data }) => {
    const res = await apiFetch(`/v1/merchants/${data.alias}`);
    if (!res.ok) return null;
    return (await res.json()) as MerchantRow;
  });

export const getVoucherProducts = createServerFn({ method: "GET" }).handler(
  async () => {
    const res = await apiFetch("/v1/vouchers/products");
    if (!res.ok) return { data: [] as VoucherProduct[] };
    return (await res.json()) as { data: VoucherProduct[] };
  },
);

export const purchaseVoucher = createServerFn({ method: "POST" })
  .inputValidator(
    z.object({
      product_slug: z.string(),
      narration: z.string().optional(),
    }),
  )
  .handler(async ({ data }) => {
    const res = await apiFetch("/v1/vouchers/purchase", {
      method: "POST",
      body: JSON.stringify(data),
    });
    const body = (await res.json()) as Record<string, unknown>;
    if (!res.ok)
      throw new Error((body?.message as string) ?? "Purchase failed");
    return { data: body };
  });

export type WalletData = {
  id: string;
  user_id: string;
  balance: number;
  ledger_balance: number;
  currency: string;
  status: string;
  alias?: string;
  virtual_account_number?: string;
  virtual_bank_name?: string;
};

export type TxRow = {
  id: string;
  type: string;
  direction: "credit" | "debit";
  amount: number;
  fee: number;
  currency: string;
  status: "completed" | "pending" | "failed";
  provider_ref?: string;
  recipient_alias?: string;
  recipient_name?: string;
  narration?: string;
  created_at: string;
};

export type BankRow = {
  code: string;
  name: string;
  short_name?: string;
};

export type ResolvedIdentity = {
  alias: string;
  alias_type: string;
  display_name: string;
  handle?: string;
  verified: boolean;
  trust_score?: number;
};

export type MerchantRow = {
  id: string;
  alias: string;
  name: string;
  category?: string;
  trust_score?: number;
  logo_url?: string;
  description?: string;
  verified: boolean;
};

export type VoucherProduct = {
  slug: string;
  name: string;
  vendor: string;
  price: number;
  currency: string;
  category?: string;
  kind?: string;
  description?: string;
};

export type MeData = Awaited<ReturnType<typeof getMe>>;
