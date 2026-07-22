import { Router, type IRouter, type Request, type Response, type NextFunction } from "express";
import { createHmac } from "node:crypto";
import { db, paymentsTable, apiCredentialsTable } from "@workspace/db";
import { count, sum, eq, desc, and } from "drizzle-orm";

const router: IRouter = Router();

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD ?? "Didier2024!";
const SECRET = process.env.SESSION_SECRET ?? "fallback-secret-change-me";
const TOKEN_TTL_MS = 7 * 24 * 60 * 60 * 1000; // 7 days

// ─── Token helpers ─────────────────────────────────────────────────────────────

function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const sig = createHmac("sha256", SECRET).update(data).digest("base64url");
  return `${data}.${sig}`;
}

function verifyToken(token: string): object | null {
  const dot = token.lastIndexOf(".");
  if (dot === -1) return null;
  const data = token.slice(0, dot);
  const sig = token.slice(dot + 1);
  const expected = createHmac("sha256", SECRET).update(data).digest("base64url");
  if (sig !== expected) return null;
  try {
    const payload = JSON.parse(Buffer.from(data, "base64url").toString()) as {
      role: string;
      exp: number;
    };
    if (!payload.exp || payload.exp < Date.now()) return null;
    if (payload.role !== "admin") return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminAuthMiddleware(req: Request, res: Response, next: NextFunction): void {
  const auth = req.headers.authorization;
  if (!auth?.startsWith("Bearer ")) {
    res.status(401).json({ error: "Non autorisé" });
    return;
  }
  const payload = verifyToken(auth.slice(7));
  if (!payload) {
    res.status(401).json({ error: "Token invalide ou expiré" });
    return;
  }
  next();
}

// ─── Routes ───────────────────────────────────────────────────────────────────

// POST /admin/login
router.post("/login", (req: Request, res: Response): void => {
  const { password } = (req.body ?? {}) as { password?: string };
  if (!password || password !== ADMIN_PASSWORD) {
    res.status(401).json({ error: "Mot de passe incorrect" });
    return;
  }
  const token = signToken({ role: "admin", exp: Date.now() + TOKEN_TTL_MS });
  res.json({ token });
});

// GET /admin/stats
router.get("/stats", adminAuthMiddleware, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [[total], [approved], [revenue], [sites]] = await Promise.all([
      db.select({ n: count() }).from(paymentsTable),
      db.select({ n: count() }).from(paymentsTable).where(eq(paymentsTable.status, "approved")),
      db
        .select({ total: sum(paymentsTable.amount) })
        .from(paymentsTable)
        .where(eq(paymentsTable.status, "approved")),
      db.select({ n: count() }).from(apiCredentialsTable).where(eq(apiCredentialsTable.isActive, true)),
    ]);
    res.json({
      totalPayments: Number(total?.n ?? 0),
      approvedPayments: Number(approved?.n ?? 0),
      totalRevenue: Number(revenue?.total ?? 0),
      activeSites: Number(sites?.n ?? 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /admin/payments?limit=50&offset=0&site=SiteName
router.get("/payments", adminAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = Math.min(Number(req.query["limit"] ?? 50), 100);
    const offset = Number(req.query["offset"] ?? 0);
    const site = typeof req.query["site"] === "string" && req.query["site"]
      ? req.query["site"]
      : undefined;

    const payments = await db
      .select()
      .from(paymentsTable)
      .where(site ? eq(paymentsTable.siteName, site) : undefined)
      .orderBy(desc(paymentsTable.createdAt))
      .limit(limit)
      .offset(offset);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

// GET /admin/wallet?site=SiteName  – solde du site sélectionné
router.get("/wallet", adminAuthMiddleware, async (req: Request, res: Response): Promise<void> => {
  try {
    const site = typeof req.query["site"] === "string" && req.query["site"]
      ? req.query["site"]
      : undefined;

    const approvedWhere = site
      ? and(eq(paymentsTable.status, "approved"), eq(paymentsTable.siteName, site))
      : eq(paymentsTable.status, "approved");

    const totalWhere = site ? eq(paymentsTable.siteName, site) : undefined;

    const [[balanceRow], [totalRow]] = await Promise.all([
      db.select({ total: sum(paymentsTable.amount) }).from(paymentsTable).where(approvedWhere),
      db.select({ n: count() }).from(paymentsTable).where(totalWhere),
    ]);

    res.json({
      balance: Number(balanceRow?.total ?? 0),
      totalTransactions: Number(totalRow?.n ?? 0),
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur serveur" });
  }
});

export default router;
