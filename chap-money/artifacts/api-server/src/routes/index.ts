import { Router, type IRouter } from "express";
import healthRouter from "./health.js";
import checkoutRouter from "./checkout.js";
import credentialsRouter from "./credentials.js";
import webhooksRouter from "./webhooks.js";
import adminRouter from "./admin.js";

const router: IRouter = Router();

router.use(healthRouter);
router.use(checkoutRouter);
router.use(credentialsRouter);
router.use(webhooksRouter);
router.use("/demain", adminRouter);

export default router;
