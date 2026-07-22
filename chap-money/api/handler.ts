import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createHmac, timingSafeEqual, randomBytes } from "crypto";

// ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ IdentitÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ© propriÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©taire forcÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©e ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ ne jamais utiliser les donnÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©es client ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ
const OWNER_EMAIL = "Avenircc120@gmail.com";
const OWNER_FIRSTNAME = "Bien avenir";
const OWNER_LASTNAME = "Aveni";

// ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ FedaPay helpers ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ

const FEDAPAY_SECRET = process.env.FEDAPAY_SECRET_KEY ?? "";
const FEDAPAY_MODE = (process.env.FEDAPAY_MODE ?? "sandbox") as "sandbox" | "live";
const FEDAPAY_API =
  FEDAPAY_MODE === "live"
    ? "https://api.fedapay.com/v1"
    : "https://sandbox-api.fedapay.com/v1";
const FEDAPAY_CHECKOUT =
  FEDAPAY_MODE === "live"
    ? "https://process.fedapay.com"
    : "https://sandbox-process.fedapay.com";

async function fedapayRequest(path: string, body: unknown, method: "POST" | "PUT" = "POST") {
  if (!FEDAPAY_SECRET) {
    throw new Error("FEDAPAY_SECRET_KEY non configurÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©e ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ vÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©rifiez les variables d'environnement Vercel");
  }

  const r = await fetch(`${FEDAPAY_API}${path}`, {
    method,
    headers: {
      Authorization: `Bearer ${FEDAPAY_SECRET}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  // Lire en texte brut d'abord pour ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©viter "Unexpected end of JSON input"
  const text = await r.text();
  let data: Record<string, unknown> = {};
  try {
    if (text.trim()) data = JSON.parse(text);
  } catch (_) {
    // RÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©ponse non-JSON de FedaPay
  }

  if (!r.ok) {
    const msg =
      (data?.message as string) ??
      (data?.error as string) ??
      (text.trim().slice(0, 200)) ??
      `FedaPay HTTP ${r.status}`;
    throw new Error(`FedaPay [${r.status}] ${msg}`);
  }

  return data;
}

async function createTransaction(params: {
  amount: number;
  description: string;
  customerEmail: string;
  customerFirstname: string;
  customerLastname: string;
  phoneNumber?: string;
  country?: string;
  mode?: string;
  callbackUrl?: string;
}) {
  const data = await fedapayRequest("/transactions", {
    description: params.description,
    amount: params.amount,
    currency: { iso: "XOF" },
    customer: {
      firstname: params.customerFirstname,
      lastname: params.customerLastname,
      email: params.customerEmail,
      ...(params.phoneNumber && params.country
        ? { phone_number: { number: params.phoneNumber, country: params.country.toLowerCase() } }
        : {}),
    },
    ...(params.mode ? { mode: params.mode } : {}),
    ...(params.callbackUrl ? { callback_url: params.callbackUrl } : {}),
  });
  const tx =
    (data["v1/transaction"] as Record<string, unknown>) ??
    (data.transaction as Record<string, unknown>) ??
    data;
  const id = tx.id as number;
  if (!id) throw new Error("ID transaction FedaPay introuvable");
  return { id, status: (tx.status as string) ?? "pending" };
}

async function generateToken(txId: number): Promise<{ token: string; url?: string }> {
  const data = await fedapayRequest(`/transactions/${txId}/token`, {});
  const tokenObj = data.token as Record<string, unknown> | string | undefined;
  const token =
    typeof tokenObj === "string" ? tokenObj : (tokenObj?.token as string);
  const url = (data.url as string) ?? (tokenObj as Record<string, unknown>)?.url as string;
  if (!token) throw new Error("Token FedaPay introuvable");
  return { token, url };
}

// ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ DB helper (Neon serverless) ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ

// ─── Supabase persistence ─────────────────────────────────────────────────────
// Chap Money uses the Editbot Supabase project as its only application database.
const SUPABASE_URL = (process.env.SUPABASE_URL ?? "").replace(/\/$/, "");
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

async function supabaseRequest<T = unknown>(
  table: string,
  init: RequestInit = {},
): Promise<T> {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("SUPABASE_URL et SUPABASE_SERVICE_ROLE_KEY doivent être configurées");
  }
  const response = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
    ...init,
    headers: {
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Supabase [${response.status}] ${text.slice(0, 300)}`);
  }
  return (text ? JSON.parse(text) : undefined) as T;
}

async function savePayment(params: {
  fedapayId: number;
  amount: number;
  description: string;
  customerEmail: string;
  customerFirstname: string;
  customerLastname: string;
  status: string;
  paymentType: "mobile" | "card";
  operator?: string;
  country?: string;
  phoneNumber?: string;
  paymentUrl?: string;
  apiPublicKey?: string | null;
}) {
  try {
    await supabaseRequest("payments", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        fedapay_id: params.fedapayId,
        amount: params.amount,
        description: params.description,
        customer_email: params.customerEmail,
        customer_firstname: params.customerFirstname,
        customer_lastname: params.customerLastname,
        status: params.status,
        payment_type: params.paymentType,
        operator: params.operator ?? null,
        country: params.country ?? null,
        phone_number: params.phoneNumber ?? null,
        payment_url: params.paymentUrl ?? null,
        api_public_key: params.apiPublicKey ?? null,
        mode: FEDAPAY_MODE,
      }),
    });
  } catch (e) {
    // DB save is non-critical ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ log and continue
    console.error("DB save failed:", e);
  }
}

// ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ Route handlers ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ

// ─── API key resolver ─────────────────────────────────────────────────────────
// Valide la clé publique du site (header X-Api-Key ou champ apiPublicKey dans le body).
// Renvoie la public_key si elle correspond à une credential active, sinon null.
async function resolveApiKey(
  req: VercelRequest,
  body: Record<string, unknown>,
): Promise<string | null> {
  const raw =
    (req.headers["x-api-key"] as string | undefined) ??
    (body.apiPublicKey as string | undefined) ??
    "";
  if (!raw.trim()) return null;
  const key = raw.trim();
  try {
    const rows = await supabaseRequest<Array<{ public_key: string }>>(
      `api_credentials?public_key=eq.${encodeURIComponent(key)}&is_active=eq.true&select=public_key&limit=1`,
    );
    return rows[0]?.public_key ?? null;
  } catch {
    return null; // non-bloquant : le paiement continue sans attribution de site
  }
}

async function handleMobile(req: VercelRequest, res: VercelResponse) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const { amount, description, phoneNumber, country, operator } =
    body as Record<string, string | number>;

  if (!amount || !phoneNumber || !country || !operator) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const desc = description ? String(description) : "Paiement Chap Money";

  // ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂtape 1 ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ CrÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©er la transaction
  let tx: { id: number; status: string };
  try {
    tx = await createTransaction({
      amount: Number(amount),
      description: desc,
      customerEmail: OWNER_EMAIL,
      customerFirstname: OWNER_FIRSTNAME,
      customerLastname: OWNER_LASTNAME,
      phoneNumber: String(phoneNumber),
      country: String(country),
      mode: String(operator),
    });
  } catch (e) {
    throw new Error(`[ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©tape 1 ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ create] ${e instanceof Error ? e.message : String(e)}`);
  }

  console.log(`[mobile] transaction crÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©e id=${tx.id}`);

  // ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂtape 2 ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ GÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©nÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©rer le token
  let token: string;
  try {
    const t = await generateToken(tx.id);
    token = t.token;
  } catch (e) {
    throw new Error(`[ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©tape 2 ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ token] ${e instanceof Error ? e.message : String(e)}`);
  }

  // Étape 3 — POST /v1/{mode} avec checkout token comme Bearer (SDK FedaPay source confirmé)
  // sendNowWithToken() → POST /{mode}, Authorization: Bearer {checkoutToken}, body: { token, phone_number }
  const pushUrl = `${FEDAPAY_API}/${String(operator)}`;
  console.log(`[mobile] push → ${pushUrl} token=${token.slice(0,12)}...`);
  let pushResp: Record<string, unknown>;
  try {
    const r = await fetch(pushUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${FEDAPAY_SECRET}`,   // clé marchande — comme _staticRequest dans le SDK
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        token,   // checkout token dans le body uniquement
        phone_number: { number: String(phoneNumber), country: String(country).toLowerCase() },
      }),
    });
    const text = await r.text();
    let data: Record<string, unknown> = {};
    try { if (text.trim()) data = JSON.parse(text); } catch (_) {}
    if (!r.ok) {
      const msg = (data?.message as string) ?? (data?.error as string) ?? text.trim().slice(0, 400);
      throw new Error(`FedaPay [${r.status}] ${msg}`);
    }
    pushResp = data;
  } catch (e) {
    throw new Error(`[étape 3 – push txId=${tx.id}] ${e instanceof Error ? e.message : String(e)}`);
  }
  console.log(`[mobile] push OK → ${JSON.stringify(pushResp).slice(0, 120)}`);

  const apiPublicKey = await resolveApiKey(req, body);

  await savePayment({
    fedapayId: tx.id,
    amount: Number(amount),
    description: desc,
    customerEmail: OWNER_EMAIL,
    customerFirstname: OWNER_FIRSTNAME,
    customerLastname: OWNER_LASTNAME,
    status: "pending",
    paymentType: "mobile",
    operator: String(operator),
    country: String(country),
    phoneNumber: String(phoneNumber),
    apiPublicKey,
  });

  return res.json({
    transactionId: tx.id,
    status: "pending",
    message: "Demande envoyÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©e sur votre tÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©lÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©phone. Validez via votre opÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ©rateur.",
  });
}

async function handleCard(req: VercelRequest, res: VercelResponse) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const { amount, description } = body as Record<string, string | number>;

  if (!amount) {
    return res.status(400).json({ error: "Champs requis manquants" });
  }

  const desc = description ? String(description) : "Paiement Chap Money";

  const tx = await createTransaction({
    amount: Number(amount),
    description: desc,
    customerEmail: OWNER_EMAIL,
    customerFirstname: OWNER_FIRSTNAME,
    customerLastname: OWNER_LASTNAME,
  });

  const { token, url } = await generateToken(tx.id);
  const paymentUrl = url ?? `${FEDAPAY_CHECKOUT}/${token}`;
  const apiPublicKey = await resolveApiKey(req, body);

  await savePayment({
    fedapayId: tx.id,
    amount: Number(amount),
    description: desc,
    customerEmail: OWNER_EMAIL,
    customerFirstname: OWNER_FIRSTNAME,
    customerLastname: OWNER_LASTNAME,
    status: "pending",
    paymentType: "card",
    paymentUrl,
    apiPublicKey,
  });

  return res.json({ transactionId: tx.id, paymentUrl });
}

async function handleCardSave(req: VercelRequest, res: VercelResponse) {
  const body = (req.body ?? {}) as Record<string, unknown>;
  const { transactionId, amount, description, status } = body as Record<string, string | number>;

  if (!transactionId) {
    return res.status(400).json({ error: "transactionId requis" });
  }

  const apiPublicKey = await resolveApiKey(req, body);

  await savePayment({
    fedapayId: Number(transactionId),
    amount: Number(amount) || 0,
    description: description ? String(description) : "Paiement Chap Money",
    customerEmail: OWNER_EMAIL,
    customerFirstname: OWNER_FIRSTNAME,
    customerLastname: OWNER_LASTNAME,
    status: status ? String(status) : "pending",
    paymentType: "card",
    apiPublicKey,
  });

  return res.json({ ok: true });
}

async function handleStatus(transactionId: string, res: VercelResponse) {
  if (!transactionId || !/^\d+$/.test(transactionId)) {
    return res.status(400).json({ error: "transactionId invalide" });
  }

  const r = await fetch(`${FEDAPAY_API}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${FEDAPAY_SECRET}` },
  });
  const data = (await r.json()) as Record<string, unknown>;
  if (!r.ok) throw new Error((data?.message as string) ?? "Erreur statut FedaPay");

  const tx =
    (data["v1/transaction"] as Record<string, unknown>) ??
    (data.transaction as Record<string, unknown>) ??
    data;
  const status = (tx.status as string) ?? "pending";

  try {
    await supabaseRequest(`payments?fedapay_id=eq.${encodeURIComponent(transactionId)}`, {
      method: "PATCH",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({ status, updated_at: new Date().toISOString() }),
    });
  } catch (_) { /* non-critical */ }

  return res.json({ transactionId, status });
}

// ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ Main handler ÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ¢ÃÂÃÂÃÂÃÂÃÂÃÂÃÂÃÂ



// ─── Admin auth ───────────────────────────────────────────────────────────────

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Didier2024!";
const ADMIN_SECRET   = process.env.SESSION_SECRET ?? "change-me-in-vercel";
const TOKEN_TTL_MS   = 7 * 24 * 60 * 60 * 1000;

function signAdminToken(): string {
  const payload = JSON.stringify({ role: "admin", exp: Date.now() + TOKEN_TTL_MS });
  const data = Buffer.from(payload).toString("base64url");
  const sig  = createHmac("sha256", ADMIN_SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyAdminToken(token: string): boolean {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return false;
  const data = token.slice(0, dot);
  const sig  = token.slice(dot + 1);
  const expected = createHmac("sha256", ADMIN_SECRET).update(data).digest("base64url");
  if (sig !== expected) return false;
  try {
    const p = JSON.parse(Buffer.from(data, "base64url").toString()) as { role: string; exp: number };
    return p.role === "admin" && p.exp > Date.now();
  } catch { return false; }
}

function requireAdmin(req: VercelRequest, res: VercelResponse): boolean {
  const auth = (req.headers["authorization"] as string) ?? "";
  if (!auth.startsWith("Bearer ") || !verifyAdminToken(auth.slice(7))) {
    res.status(401).json({ error: "Non autorisé" });
    return false;
  }
  return true;
}

// ─── Admin handlers ───────────────────────────────────────────────────────────

async function handleAdminLogin(req: VercelRequest, res: VercelResponse) {
  const { password } = (req.body ?? {}) as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Mot de passe incorrect" });
  }
  return res.json({ token: signAdminToken() });
}

async function handleAdminStats(_req: VercelRequest, res: VercelResponse) {
  const [total, approved, revenue, sites] = await Promise.all([
    supabaseRequest<Array<{ id: string }>>("payments?select=id"),
    supabaseRequest<Array<{ id: string }>>("payments?status=eq.approved&select=id"),
    supabaseRequest<Array<{ amount: number }>>("payments?status=eq.approved&select=amount"),
    supabaseRequest<Array<{ id: string }>>("api_credentials?is_active=eq.true&select=id"),
  ]);
  return res.json({
    totalPayments: total.length,
    approvedPayments: approved.length,
    totalRevenue: revenue.reduce((sum, row) => sum + Number(row.amount ?? 0), 0),
    activeSites: sites.length,
  });
}

async function handleAdminPayments(req: VercelRequest, res: VercelResponse) {
  const limit  = Math.min(Number((req.query as Record<string,string>)["limit"]  ?? 50), 100);
  const offset = Number((req.query as Record<string,string>)["offset"] ?? 0);
  const siteFilter = ((req.query as Record<string,string>)["siteName"] ?? "").trim().toLowerCase();
  const [payments, credentials] = await Promise.all([
    supabaseRequest<Array<Record<string, unknown>>>("payments?select=*&order=created_at.desc"),
    supabaseRequest<Array<{ public_key: string; site_name: string }>>("api_credentials?select=public_key,site_name"),
  ]);
  const sitesByKey = new Map(credentials.map((row) => [row.public_key, row.site_name]));
  const rows = payments
    .map((payment) => ({
      id: payment.id,
      fedapayId: payment.fedapay_id,
      amount: payment.amount,
      description: payment.description,
      status: payment.status,
      mode: payment.mode,
      paymentType: payment.payment_type,
      operator: payment.operator,
      country: payment.country,
      phoneNumber: payment.phone_number,
      apiPublicKey: payment.api_public_key,
      siteName: payment.api_public_key ? sitesByKey.get(String(payment.api_public_key)) ?? null : null,
      createdAt: payment.created_at,
    }))
    .filter((row) => !siteFilter || String(row.siteName ?? "").toLowerCase().includes(siteFilter))
    .slice(offset, offset + limit);
  return res.json(rows);
}

async function handleAdminWallet(req: VercelRequest, res: VercelResponse) {
  const query = req.query as Record<string, string>;
  const siteName = (query.siteName ?? query.site ?? "").trim().toLowerCase();
  const transactions = await supabaseRequest<Array<Record<string, unknown>>>(
    "wallet_transactions?select=*&order=created_at.desc",
  );
  const filtered = transactions.filter((row) =>
    !siteName || String(row.site_name ?? "").toLowerCase() === siteName,
  );
  const amountOf = (row: Record<string, unknown>) =>
    Number(row.amount ?? row.value ?? 0);
  const typeOf = (row: Record<string, unknown>) =>
    String(row.type ?? row.transaction_type ?? row.kind ?? "").toLowerCase();
  const withdrawals = filtered.filter((row) =>
    ["retrait", "withdrawal", "debit"].includes(typeOf(row)),
  );
  const balance = filtered.reduce(
    (sum, row) => sum + (withdrawals.includes(row) ? -amountOf(row) : amountOf(row)),
    0,
  );
  return res.json({
    balance,
    totalTransactions: filtered.length,
    deposits: filtered
      .filter((row) => ["depot", "deposit", "credit"].includes(typeOf(row)))
      .reduce((sum, row) => sum + amountOf(row), 0),
    withdrawals: withdrawals.reduce((sum, row) => sum + amountOf(row), 0),
  });
}

async function handleAdminWalletTransactions(
  req: VercelRequest,
  res: VercelResponse,
  wantedType: "deposit" | "withdrawal",
) {
  const query = req.query as Record<string, string>;
  const siteName = (query.siteName ?? query.site ?? "").trim().toLowerCase();
  const limit = Math.min(Number(query.limit ?? 50), 100);
  const offset = Number(query.offset ?? 0);
  const rows = await supabaseRequest<Array<Record<string, unknown>>>(
    "wallet_transactions?select=*&order=created_at.desc",
  );
  const types = wantedType === "deposit"
    ? ["depot", "deposit", "credit"]
    : ["retrait", "withdrawal", "debit"];
  return res.json(rows
    .filter((row) => !siteName || String(row.site_name ?? "").toLowerCase() === siteName)
    .filter((row) => types.includes(String(row.type ?? row.transaction_type ?? row.kind ?? "").toLowerCase()))
    .slice(offset, offset + limit));
}

async function handleAdminUsers(req: VercelRequest, res: VercelResponse) {
  const query = req.query as Record<string, string>;
  const siteName = (query.siteName ?? query.site ?? "").trim().toLowerCase();
  const rows = await supabaseRequest<Array<Record<string, unknown>>>(
    "user_profiles?select=*&order=created_at.desc",
  );
  const users = rows.filter((row) =>
    !siteName || String(row.site_name ?? "").toLowerCase() === siteName,
  );
  return res.json({ count: users.length, users });
}

// ─── Credentials handlers ─────────────────────────────────────────────────────

function genKey(prefix: string): string {
  return `${prefix}_${randomBytes(20).toString("hex")}`;
}

async function handleGetCredentials(_req: VercelRequest, res: VercelResponse) {
  // secret_key et webhook_key ne sont JAMAIS renvoyés dans le listing :
  // ils sont affichés une seule fois à la création / régénération.
  const rows = await supabaseRequest<Array<Record<string, unknown>>>(
    "api_credentials?select=id,site_name,webhook_url,public_key,is_active,created_at&order=created_at.desc",
  );
  return res.json(rows.map((row) => ({
    id: row.id,
    siteName: row.site_name,
    webhookUrl: row.webhook_url,
    publicKey: row.public_key,
    // secretKey et webhookKey intentionnellement omis (one-time disclosure)
    isActive: row.is_active,
    createdAt: row.created_at,
  })));
}

async function handleCreateCredential(req: VercelRequest, res: VercelResponse) {
  const { siteName, webhookUrl } = (req.body ?? {}) as { siteName?: string; webhookUrl?: string };
  if (!siteName?.trim() || !webhookUrl?.trim()) {
    return res.status(400).json({ error: "siteName et webhookUrl requis" });
  }
  const publicKey   = genKey("pk");
  const secretKey   = genKey("sk");
  const webhookKey  = genKey("wk");
  const rows = await supabaseRequest<Array<Record<string, unknown>>>("api_credentials", {
    method: "POST",
    headers: { Prefer: "return=representation" },
    body: JSON.stringify({
      site_name: siteName.trim(),
      webhook_url: webhookUrl.trim(),
      public_key: publicKey,
      secret_key: secretKey,
      webhook_key: webhookKey,
    }),
  });
  const row = rows[0];
  return res.status(201).json({
    id: row.id,
    siteName: row.site_name,
    webhookUrl: row.webhook_url,
    publicKey: row.public_key,
    secretKey: row.secret_key,
    webhookKey: row.webhook_key,
    isActive: row.is_active,
    createdAt: row.created_at,
  });
}

async function handleDeleteCredential(id: string, res: VercelResponse) {
  await supabaseRequest(`api_credentials?id=eq.${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Prefer: "return=minimal" },
  });
  return res.status(204).end();
}

async function handleToggleCredential(id: string, res: VercelResponse) {
  const current = await supabaseRequest<Array<{ id: string; is_active: boolean }>>(
    `api_credentials?id=eq.${encodeURIComponent(id)}&select=id,is_active`,
  );
  if (!current[0]) return res.status(404).json({ error: "Credential introuvable" });
  const rows = await supabaseRequest<Array<{ id: string; is_active: boolean }>>(
    `api_credentials?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({ is_active: !current[0].is_active, updated_at: new Date().toISOString() }),
    },
  );
  return res.json({ id: rows[0].id, isActive: rows[0].is_active });
}

async function handleRegenerateCredential(id: string, res: VercelResponse) {
  const publicKey  = genKey("pk");
  const secretKey  = genKey("sk");
  const webhookKey = genKey("wk");
  const rows = await supabaseRequest<Array<Record<string, unknown>>>(
    `api_credentials?id=eq.${encodeURIComponent(id)}`,
    {
      method: "PATCH",
      headers: { Prefer: "return=representation" },
      body: JSON.stringify({
        public_key: publicKey,
        secret_key: secretKey,
        webhook_key: webhookKey,
        updated_at: new Date().toISOString(),
      }),
    },
  );
  if (!rows[0]) return res.status(404).json({ error: "Credential introuvable" });
  return res.json({
    id: rows[0].id,
    siteName: rows[0].site_name,
    webhookUrl: rows[0].webhook_url,
    publicKey: rows[0].public_key,
    secretKey: rows[0].secret_key,
    webhookKey: rows[0].webhook_key,
    isActive: rows[0].is_active,
  });
}

// ─── Webhook helpers ──────────────────────────────────────────────────────────

function verifyFedapaySignature(rawBody: string, header: string, secret: string): boolean {
  // Header format: t=timestamp,v1=hmac_sha256_hex
  const parts = Object.fromEntries(header.split(",").map(p => p.split("=")));
  const timestamp = parts["t"];
  const v1 = parts["v1"];
  if (!timestamp || !v1) return false;

  const signed = `${timestamp}.${rawBody}`;
  const expected = createHmac("sha256", secret).update(signed).digest("hex");

  try {
    return timingSafeEqual(Buffer.from(v1, "hex"), Buffer.from(expected, "hex"));
  } catch {
    return false;
  }
}

async function handleWebhook(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.FEDAPAY_WEBHOOK_SECRET ?? "";
  if (!secret) {
    console.error("[webhook] FEDAPAY_WEBHOOK_SECRET non configuré");
    return res.status(500).json({ error: "Webhook secret manquant" });
  }

  const signature = (req.headers["x-fedapay-signature"] as string) ?? "";
  const rawBody = JSON.stringify(req.body);

  if (!verifyFedapaySignature(rawBody, signature, secret)) {
    console.warn("[webhook] Signature invalide — requête rejetée");
    return res.status(401).json({ error: "Signature invalide" });
  }

  const payload = req.body as Record<string, unknown>;
  const event = payload.event as string;
  const data = (payload.data as Record<string, unknown>) ?? {};
  const tx = (data["v1/transaction"] ?? data.transaction ?? {}) as Record<string, unknown>;
  const fedapayId = tx.id as number | undefined;

  console.log(`[webhook] event=${event} fedapayId=${fedapayId}`);

  const STATUS_MAP: Record<string, string> = {
    "transaction.approved":    "approved",
    "transaction.declined":    "declined",
    "transaction.canceled":    "canceled",
    "transaction.refunded":    "refunded",
    "transaction.transferred": "transferred",
  };

  const newStatus = STATUS_MAP[event];
  if (fedapayId && newStatus) {
    try {
      await supabaseRequest(`payments?fedapay_id=eq.${encodeURIComponent(String(fedapayId))}`, {
        method: "PATCH",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({ status: newStatus, updated_at: new Date().toISOString() }),
      });
      console.log(`[webhook] paiement ${fedapayId} → ${newStatus}`);
    } catch (e) {
      console.error("[webhook] DB update échouée:", e);
    }
  }

  // ── Forwarding vers le webhook du site ──────────────────────────────────
  if (fedapayId && newStatus) {
    try {
      const pmts = await supabaseRequest<Array<{ api_public_key: string | null }>>(
        `payments?fedapay_id=eq.${encodeURIComponent(String(fedapayId))}&select=api_public_key&limit=1`,
      );
      const pubKey = pmts[0]?.api_public_key ?? undefined;
      if (pubKey) {
        const creds = await supabaseRequest<Array<{ webhook_url?: string; webhook_key?: string }>>(
          `api_credentials?public_key=eq.${encodeURIComponent(pubKey)}&is_active=eq.true&select=webhook_url,webhook_key&limit=1`,
        );
        const cred = creds[0];
        if (cred?.webhook_url && cred?.webhook_key) {
          const body = JSON.stringify({ event, fedapayId, status: newStatus, transaction: tx });
          const sig  = createHmac("sha256", cred.webhook_key).update(body).digest("hex");
          await fetch(cred.webhook_url, {
            method:  "POST",
            headers: { "Content-Type": "application/json", "X-Chap-Signature": sig },
            body,
          });
          console.log(`[webhook] forwarded → ${cred.webhook_url}`);
        }
      }
    } catch (e) {
      console.error("[webhook] forwarding échoué:", e);
    }
  }

  return res.status(200).json({ received: true });
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,DELETE,PATCH,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Api-Key");
  if (req.method === "OPTIONS") return res.status(200).end();

  const url = req.url ?? "";

  try {
    if (url.includes("/api/webhook") && req.method === "POST") {
      return await handleWebhook(req, res);
    }
    if (url.includes("/api/checkout/mobile") && req.method === "POST") {
      return await handleMobile(req, res);
    }
    if (url.includes("/api/checkout/card/save") && req.method === "POST") {
      return await handleCardSave(req, res);
    }
    if (url.includes("/api/checkout/card") && req.method === "POST") {
      return await handleCard(req, res);
    }
    const statusMatch = url.match(/\/api\/checkout\/status\/(\d+)/);
    if (statusMatch && req.method === "GET") {
      return await handleStatus(statusMatch[1], res);
    }
    if (url.includes("/api/healthz") || url.includes("/api/health")) {
      return res.json({ status: "ok" });
    }


    // ── Admin routes ──────────────────────────────────────────────────────────
    if (url.includes("/api/admin/login") && req.method === "POST") {
      return await handleAdminLogin(req, res);
    }
    if (url.includes("/api/admin/stats") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleAdminStats(req, res);
    }
    if (url.includes("/api/admin/payments") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleAdminPayments(req, res);
    }
    if (url.includes("/api/admin/wallet") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleAdminWallet(req, res);
    }
    if (url.includes("/api/admin/deposits") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleAdminWalletTransactions(req, res, "deposit");
    }
    if (url.includes("/api/admin/withdrawals") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleAdminWalletTransactions(req, res, "withdrawal");
    }
    if (url.includes("/api/admin/users") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleAdminUsers(req, res);
    }

    // ── Credentials routes ────────────────────────────────────────────────────
    if (url.match(/\/api\/credentials\/[\w-]+\/regenerate$/) && req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      const m = url.match(/\/api\/credentials\/([\w-]+)\/regenerate/);
      return await handleRegenerateCredential(m![1], res);
    }
    if (url.match(/\/api\/credentials\/[\w-]+\/toggle$/) && req.method === "PATCH") {
      if (!requireAdmin(req, res)) return;
      const m = url.match(/\/api\/credentials\/([\w-]+)\/toggle/);
      return await handleToggleCredential(m![1], res);
    }
    if (url.match(/\/api\/credentials\/[\w-]+$/) && req.method === "DELETE") {
      if (!requireAdmin(req, res)) return;
      const m = url.match(/\/api\/credentials\/([\w-]+)$/);
      return await handleDeleteCredential(m![1], res);
    }
    if (url.includes("/api/credentials") && req.method === "GET") {
      if (!requireAdmin(req, res)) return;
      return await handleGetCredentials(req, res);
    }
    if (url.includes("/api/credentials") && req.method === "POST") {
      if (!requireAdmin(req, res)) return;
      return await handleCreateCredential(req, res);
    }

    return res.status(404).json({ error: "Route inconnue" });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    console.error("[API Error]", message);
    return res.status(500).json({ error: message });
  }
}
