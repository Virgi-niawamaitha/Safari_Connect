import { Router } from "express";
import { mpesaCallback, paymentStatus, stkPush } from "./mpesa.controller.js";

const router = Router();

router.post("/mpesa/stk-push", stkPush);
router.post("/mpesa-callback", mpesaCallback);
router.get("/mpesa/status/:checkoutRequestId", paymentStatus);

export default router;
