// FedaPay API client — clé secrète côté serveur uniquement
export type FedaPayMode = "sandbox" | "live";

export interface FedaPayConfig {
  mode: FedaPayMode;
  secretKey: string;
  apiBase: string;
  checkoutBase: string;
}

export function getFedaPayConfig(): FedaPayConfig {
  const mode: FedaPayMode =
    process.env.FEDAPAY_MODE === "live" ? "live" : "sandbox";

  const secretKey =
    mode === "live"
      ? (process.env.FEDAPAY_SECRET_KEY_LIVE ?? process.env.FEDAPAY_SECRET_KEY ?? "")
      : (process.env.FEDAPAY_SECRET_KEY_SANDBOX ?? process.env.FEDAPAY_SECRET_KEY ?? "");

  const apiBase =
    mode === "live"
      ? "https://api.fedapay.com/v1"
      : "https://sandbox-api.fedapay.com/v1";

  const checkoutBase =
    mode === "live"
      ? "https://process.fedapay.com"
      : "https://sandbox-process.fedapay.com";

  return { mode, secretKey, apiBase, checkoutBase };
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MobilePaymentInput {
  amount: number;
  description: string;
  customerEmail: string;
  customerFirstname: string;
  customerLastname: string;
  phoneNumber: string;
  /** Two-letter country code lowercase, e.g. "bj", "ci", "sn" */
  country: string;
  /** FedaPay operator mode code: mtn | moov | sbin | mtn_ci | free_sn | moov_tg | moov_bf | airtel_ne | mtn_open_gn */
  operator: string;
}

export interface CardPaymentInput {
  amount: number;
  description: string;
  customerEmail: string;
  customerFirstname: string;
  customerLastname: string;
  callbackUrl?: string;
}

export interface MobilePaymentResult {
  transactionId: number;
  status: string;
  message: string;
}

export interface CardPaymentResult {
  transactionId: number;
  paymentUrl: string;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function createTransaction(
  apiBase: string,
  secretKey: string,
  input: {
    amount: number;
    description: string;
    customerEmail: string;
    customerFirstname: string;
    customerLastname: string;
    phoneNumber?: string;
    country?: string;
    callbackUrl?: string;
  }
): Promise<{ id: number; status: string }> {
  const body: Record<string, unknown> = {
    description: input.description,
    amount: input.amount,
    currency: { iso: "XOF" },
    customer: {
      firstname: input.customerFirstname,
      lastname: input.customerLastname,
      email: input.customerEmail,
      ...(input.phoneNumber && input.country
        ? {
            phone_number: {
              number: input.phoneNumber,
              country: input.country.toLowerCase(),
            },
          }
        : {}),
    },
  };

  if (input.callbackUrl) {
    body.callback_url = input.callbackUrl;
  }

  const res = await fetch(`${apiBase}/transactions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const rawTx = await res.text();
  let data: Record<string, unknown> = {};
  try { if (rawTx.trim()) data = JSON.parse(rawTx); } catch (_) {}
  if (!res.ok) {
    throw new Error(
      (data?.message as string) ?? (data?.error as string) ?? `FedaPay HTTP ${res.status}`
    );
  }

  const tx =
    (data?.["v1/transaction"] as Record<string, unknown>) ??
    (data?.transaction as Record<string, unknown>) ??
    data;

  const id = tx?.id as number | undefined;
  if (!id) throw new Error("ID transaction FedaPay non reçu");

  return { id, status: (tx?.status as string) ?? "pending" };
}

async function generateToken(
  apiBase: string,
  secretKey: string,
  transactionId: number
): Promise<string> {
  const res = await fetch(`${apiBase}/transactions/${transactionId}/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  const rawToken = await res.text();
  let data: Record<string, unknown> = {};
  try { if (rawToken.trim()) data = JSON.parse(rawToken); } catch (_) {}
  if (!res.ok) {
    throw new Error(
      (data?.message as string) ?? (data?.error as string) ?? `FedaPay HTTP ${res.status}`
    );
  }

  const tokenObj = data?.token as Record<string, unknown> | string | undefined;
  const token =
    typeof tokenObj === "string"
      ? tokenObj
      : (tokenObj?.token as string | undefined);

  if (!token) throw new Error("Token FedaPay non reçu");
  return token;
}

// ─── Public API ──────────────────────────────────────────────────────────────

/**
 * Initiate a direct mobile money payment (no redirect).
 * Sends a USSD/OTP push to the customer's phone via FedaPay.
 */
export async function sendMobilePayment(
  input: MobilePaymentInput
): Promise<MobilePaymentResult> {
  const { secretKey, apiBase } = getFedaPayConfig();

  if (!secretKey) {
    throw new Error(
      "FEDAPAY_SECRET_KEY non configurée. Ajoutez-la dans les variables d'environnement."
    );
  }

  // 1. Create transaction
  const tx = await createTransaction(apiBase, secretKey, {
    amount: input.amount,
    description: input.description,
    customerEmail: input.customerEmail,
    customerFirstname: input.customerFirstname,
    customerLastname: input.customerLastname,
    phoneNumber: input.phoneNumber,
    country: input.country,
  });

  // 2. Generate token
  const token = await generateToken(apiBase, secretKey, tx.id);

  // 3. Push USSD/OTP au téléphone — POST /{mode}
  // SDK source (Transaction.ts): url = '/' + mode  →  {apiBase}/{mode}
  // PAS /transactions/{mode} — juste /{mode} directement sur apiBase.
  const payRes = await fetch(`${apiBase}/${input.operator}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      token,
      phone_number: {
        number: input.phoneNumber.replace(/\D/g, ""),
        country: input.country.toLowerCase(),
      },
    }),
  });

  const rawPay = await payRes.text();
  let payData: Record<string, unknown> = {};
  try { if (rawPay.trim()) payData = JSON.parse(rawPay); } catch (_) {}
  if (!payRes.ok) {
    throw new Error(
      (payData?.message as string) ?? (payData?.error as string) ?? `FedaPay HTTP ${payRes.status}`
    );
  }

  return {
    transactionId: tx.id,
    status: "pending",
    message:
      "Demande envoyée sur votre téléphone. Veuillez valider le paiement via votre opérateur mobile.",
  };
}

/**
 * Initiate a card payment — returns FedaPay hosted checkout URL for redirect.
 */
export async function initiateCardPayment(
  input: CardPaymentInput
): Promise<CardPaymentResult> {
  const { secretKey, apiBase, checkoutBase } = getFedaPayConfig();

  if (!secretKey) {
    throw new Error(
      "FEDAPAY_SECRET_KEY non configurée. Ajoutez-la dans les variables d'environnement."
    );
  }

  // 1. Create transaction
  const tx = await createTransaction(apiBase, secretKey, {
    amount: input.amount,
    description: input.description,
    customerEmail: input.customerEmail,
    customerFirstname: input.customerFirstname,
    customerLastname: input.customerLastname,
    callbackUrl: input.callbackUrl,
  });

  // 2. Generate token + get hosted checkout URL
  const tokenRes = await fetch(`${apiBase}/transactions/${tx.id}/token`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: "{}",
  });

  const rawCardToken = await tokenRes.text();
  let tokenData: Record<string, unknown> = {};
  try { if (rawCardToken.trim()) tokenData = JSON.parse(rawCardToken); } catch (_) {}
  if (!tokenRes.ok) {
    throw new Error(
      (tokenData?.message as string) ?? (tokenData?.error as string) ?? `FedaPay HTTP ${tokenRes.status}`
    );
  }

  const tokenObj = tokenData?.token as Record<string, unknown> | undefined;
  const paymentUrl =
    (tokenData?.url as string) ??
    (tokenObj?.url as string) ??
    `${checkoutBase}/${tokenObj?.token ?? ""}`;

  if (!paymentUrl) throw new Error("URL de paiement carte non reçue");

  return { transactionId: tx.id, paymentUrl };
}

/**
 * Fetch the current status of a transaction from FedaPay.
 */
export async function getTransactionStatus(
  transactionId: string
): Promise<{ status: string }> {
  const { secretKey, apiBase } = getFedaPayConfig();

  const res = await fetch(`${apiBase}/transactions/${transactionId}`, {
    headers: { Authorization: `Bearer ${secretKey}` },
  });

  const rawStatus = await res.text();
  let data: Record<string, unknown> = {};
  try { if (rawStatus.trim()) data = JSON.parse(rawStatus); } catch (_) {}
  if (!res.ok) {
    throw new Error(
      (data?.message as string) ?? (data?.error as string) ?? `FedaPay HTTP ${res.status}`
    );
  }

  const tx =
    (data?.["v1/transaction"] as Record<string, unknown>) ??
    (data?.transaction as Record<string, unknown>) ??
    data;

  return { status: (tx?.status as string) ?? "pending" };
}
