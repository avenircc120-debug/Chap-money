import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { db, apiCredentialsTable } from "@workspace/db";

function generateKey(prefix: string): string {
  return `${prefix}_${randomBytes(24).toString("hex")}`;
}

const router: IRouter = Router();

// GET /credentials — list all credentials (secret keys masked)
router.get("/credentials", async (req, res): Promise<void> => {
  try {
    const creds = await db
      .select()
      .from(apiCredentialsTable)
      .orderBy(apiCredentialsTable.createdAt);

    res.json(
      creds.map((c) => ({
        ...c,
        secretKey: c.secretKey.slice(0, 10) + "••••••••",
      }))
    );
  } catch (err: unknown) {
    req.log.error({ err }, "Erreur liste credentials");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /credentials — create new credential
router.post("/credentials", async (req, res): Promise<void> => {
  const { siteName, webhookUrl } = req.body as {
    siteName?: string;
    webhookUrl?: string;
  };

  if (!siteName || !webhookUrl) {
    res.status(400).json({ error: "siteName et webhookUrl sont requis" });
    return;
  }

  try {
    const publicKey = generateKey("pk");
    const secretKey = generateKey("sk");

    const [cred] = await db
      .insert(apiCredentialsTable)
      .values({ siteName, webhookUrl, publicKey, secretKey })
      .returning();

    // Return the full secret key once on creation
    res.status(201).json(cred);
  } catch (err: unknown) {
    req.log.error({ err }, "Erreur création credential");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// DELETE /credentials/:id
router.delete("/credentials/:id", async (req, res): Promise<void> => {
  try {
    await db
      .delete(apiCredentialsTable)
      .where(eq(apiCredentialsTable.id, req.params.id));
    res.status(204).send();
  } catch (err: unknown) {
    req.log.error({ err }, "Erreur suppression credential");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// POST /credentials/:id/regenerate — generate new keys
router.post("/credentials/:id/regenerate", async (req, res): Promise<void> => {
  try {
    const publicKey = generateKey("pk");
    const secretKey = generateKey("sk");

    const [cred] = await db
      .update(apiCredentialsTable)
      .set({ publicKey, secretKey, updatedAt: new Date() })
      .where(eq(apiCredentialsTable.id, req.params.id))
      .returning();

    if (!cred) {
      res.status(404).json({ error: "Credential non trouvé" });
      return;
    }

    // Return full keys on regeneration
    res.json(cred);
  } catch (err: unknown) {
    req.log.error({ err }, "Erreur régénération clés");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// PATCH /credentials/:id/toggle — enable / disable
router.patch("/credentials/:id/toggle", async (req, res): Promise<void> => {
  try {
    const [current] = await db
      .select({ isActive: apiCredentialsTable.isActive })
      .from(apiCredentialsTable)
      .where(eq(apiCredentialsTable.id, req.params.id))
      .limit(1);

    if (!current) {
      res.status(404).json({ error: "Credential non trouvé" });
      return;
    }

    const [cred] = await db
      .update(apiCredentialsTable)
      .set({ isActive: !current.isActive, updatedAt: new Date() })
      .where(eq(apiCredentialsTable.id, req.params.id))
      .returning();

    res.json({ ...cred, secretKey: cred.secretKey.slice(0, 10) + "••••••••" });
  } catch (err: unknown) {
    req.log.error({ err }, "Erreur toggle credential");
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
