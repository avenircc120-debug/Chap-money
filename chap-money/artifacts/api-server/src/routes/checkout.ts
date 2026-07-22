import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, paymentsTable, apiCredentialsTable } from "@workspace/db";
import {
  sendMobilePayment,
  initiateCardPayment,
  getTransactionStatus,
  getFedaPayConfig,
} from "../lib/fedapay-client.js";
import {
  InitiateMobilePaymentBody,
  InitiateCardPaymentBody,
  GetPaymentStatusParams,
} from "@workspace/api-zod";

// ─── Identité propriétaire forcée — ne jamais utiliser les données client ────
const OWNER_EMAIL = "Avenircc120@gmail.com";
const OWNER_FIRSTNAME = "Bien avenir";
const OWNER_LASTNAME = "Aveni";

const router: IRouter = Router();

/** Resolve the apiPublicKey from the X-Api-Key request header */
async function resolveApiKey(
  apiKeyHeader: string | undefined
): Promise<string | null> {
  if (!apiKeyHeader) return null;
  const [cred] = await db
    .select({ publicKey: apiCredentialsTable.publicKey })
    .from(apiCredentialsTable)
    .where(eq(apiCredentialsTable.publicKey, apiKeyHeader))
    .limit(1);
  return cred?.publicKey ?? null;
}

// POST /checkout/mobile — direct mobile money push (no redirect)
router.post("/checkout/mobile", async (req, res): Promise<void> => {
  const parse = InitiateMobilePaymentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.issues[0]?.message ?? "Données invalides" });
    return;
  }

  const body = parse.data;

  try {
    const result = await sendMobilePayment({
      amount: body.amount,
      description: body.description,
      customerEmail: OWNER_EMAIL,
      customerFirstname: OWNER_FIRSTNAME,
      customerLastname: OWNER_LASTNAME,
      phoneNumber: body.phoneNumber,
      country: body.country,
      operator: body.operator,
    });

    const { mode } = getFedaPayConfig();
    const apiPublicKey = await resolveApiKey(
      req.headers["x-api-key"] as string | undefined
    );

    await db
      .insert(paymentsTable)
      .values({
        fedapayId: result.transactionId,
        amount: body.amount,
        description: body.description,
        customerEmail: OWNER_EMAIL,
        customerFirstname: OWNER_FIRSTNAME,
        customerLastname: OWNER_LASTNAME,
        status: "pending",
        paymentType: "mobile",
        operator: body.operator,
        country: body.country,
        phoneNumber: body.phoneNumber,
        mode,
        apiPublicKey,
      })
      .onConflictDoNothing();

    res.json({
      transactionId: result.transactionId,
      status: result.status,
      message: result.message,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    req.log.error({ err }, "Erreur checkout mobile");
    res.status(500).json({ error: message });
  }
});

// POST /checkout/card — returns FedaPay hosted URL for redirect
router.post("/checkout/card", async (req, res): Promise<void> => {
  const parse = InitiateCardPaymentBody.safeParse(req.body);
  if (!parse.success) {
    res.status(400).json({ error: parse.error.issues[0]?.message ?? "Données invalides" });
    return;
  }

  const body = parse.data;

  try {
    const result = await initiateCardPayment({
      amount: body.amount,
      description: body.description,
      customerEmail: OWNER_EMAIL,
      customerFirstname: OWNER_FIRSTNAME,
      customerLastname: OWNER_LASTNAME,
    });

    const { mode } = getFedaPayConfig();
    const apiPublicKey = await resolveApiKey(
      req.headers["x-api-key"] as string | undefined
    );

    await db
      .insert(paymentsTable)
      .values({
        fedapayId: result.transactionId,
        amount: body.amount,
        description: body.description,
        customerEmail: OWNER_EMAIL,
        customerFirstname: OWNER_FIRSTNAME,
        customerLastname: OWNER_LASTNAME,
        status: "pending",
        paymentType: "card",
        paymentUrl: result.paymentUrl,
        mode,
        apiPublicKey,
      })
      .onConflictDoNothing();

    res.json({
      transactionId: result.transactionId,
      paymentUrl: result.paymentUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    req.log.error({ err }, "Erreur checkout card");
    res.status(500).json({ error: message });
  }
});

// GET /checkout/status/:transactionId — poll payment status
router.get("/checkout/status/:transactionId", async (req, res): Promise<void> => {
  const parse = GetPaymentStatusParams.safeParse(req.params);
  if (!parse.success) {
    res.status(400).json({ error: "transactionId invalide" });
    return;
  }

  const { transactionId } = parse.data;

  try {
    const { status } = await getTransactionStatus(transactionId);

    // Update status in DB
    await db
      .update(paymentsTable)
      .set({ status, updatedAt: new Date() })
      .where(eq(paymentsTable.fedapayId, parseInt(transactionId, 10)));

    // If payment just approved, forward webhook to registered site
    if (status === "approved") {
      const [payment] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.fedapayId, parseInt(transactionId, 10)))
        .limit(1);

      if (payment?.apiPublicKey) {
        const [cred] = await db
          .select()
          .from(apiCredentialsTable)
          .where(eq(apiCredentialsTable.publicKey, payment.apiPublicKey))
          .limit(1);

        if (cred?.isActive && cred?.webhookUrl) {
          fetch(cred.webhookUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "X-Chap-Money-Event": "payment.approved",
              "X-Chap-Money-Site": cred.siteName,
              "X-Chap-Money-Key": cred.publicKey,
            },
            body: JSON.stringify({
              event: "payment.approved",
              transactionId,
              status,
              amount: payment.amount,
              description: payment.description,
              paymentType: payment.paymentType,
              mode: payment.mode,
            }),
            signal: AbortSignal.timeout(8000),
          }).catch((err: unknown) => {
            req.log.error({ err, webhookUrl: cred.webhookUrl }, "Erreur forward webhook (status)");
          });
        }
      }
    }

    res.json({ transactionId, status });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Erreur serveur";
    req.log.error({ err }, "Erreur statut paiement");
    res.status(500).json({ error: message });
  }
});

export default router;
