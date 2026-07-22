import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, apiCredentialsTable, paymentsTable } from "@workspace/db";

const router: IRouter = Router();

// POST /webhooks/fedapay — FedaPay envoie les événements de paiement ici
// Configurez cette URL dans votre dashboard FedaPay comme webhook central.
router.post("/webhooks/fedapay", async (req, res): Promise<void> => {
  try {
    const event = req.body as Record<string, unknown>;
    req.log.info({ event }, "FedaPay webhook reçu");

    // FedaPay structure: event.name = "transaction.approved" | "transaction.declined" ...
    // event.data = { id: number, ... }
    const data = event.data as Record<string, unknown> | undefined;
    const rawId = data?.id ?? (event.transaction as Record<string, unknown>)?.id;
    const transactionId = rawId != null ? parseInt(String(rawId), 10) : null;

    if (transactionId != null && !isNaN(transactionId)) {
      // Find the matching payment in our DB
      const [payment] = await db
        .select()
        .from(paymentsTable)
        .where(eq(paymentsTable.fedapayId, transactionId))
        .limit(1);

      // Update payment status from event name
      const eventName = String(event.name ?? "");
      const newStatus = eventName.includes("approved")
        ? "approved"
        : eventName.includes("declined")
          ? "declined"
          : eventName.includes("canceled")
            ? "canceled"
            : null;

      if (newStatus) {
        await db
          .update(paymentsTable)
          .set({ status: newStatus, updatedAt: new Date() })
          .where(eq(paymentsTable.fedapayId, transactionId));
      }

      // Forward to registered webhook if payment has an apiPublicKey
      if (payment?.apiPublicKey) {
        const [cred] = await db
          .select()
          .from(apiCredentialsTable)
          .where(eq(apiCredentialsTable.publicKey, payment.apiPublicKey))
          .limit(1);

        if (cred?.isActive && cred?.webhookUrl) {
          try {
            const forwarded = await fetch(cred.webhookUrl, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "X-Chap-Money-Event": String(event.name ?? "payment.updated"),
                "X-Chap-Money-Site": cred.siteName,
                "X-Chap-Money-Key": cred.publicKey,
              },
              body: JSON.stringify({
                event: event.name,
                transactionId,
                status: newStatus ?? data?.status,
                amount: data?.amount,
                currency: data?.currency,
                raw: event,
              }),
              signal: AbortSignal.timeout(8000),
            });
            req.log.info(
              { webhookUrl: cred.webhookUrl, status: forwarded.status },
              "Webhook forwardé"
            );
          } catch (fwdErr: unknown) {
            // Log but don't fail — FedaPay needs a 200 response
            req.log.error(
              { fwdErr, webhookUrl: cred.webhookUrl },
              "Erreur forward webhook"
            );
          }
        }
      }
    }

    res.json({ received: true });
  } catch (err: unknown) {
    req.log.error({ err }, "Erreur webhook FedaPay");
    // Still return 200 so FedaPay doesn't retry infinitely
    res.json({ received: true });
  }
});

export default router;
