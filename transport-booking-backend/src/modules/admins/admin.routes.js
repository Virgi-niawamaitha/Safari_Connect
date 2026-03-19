import { Router } from "express";
import {
  getStats, listUsers, listBookings, listSaccos,
  listPayments, updateUserStatus, updateSaccoStatus,
} from "./admin.controller.js";
import { authenticate } from "../../middlewares/auth.middleware.js";
import { authorize } from "../../middlewares/role.middleware.js";

const router = Router();
const adminOnly = [authenticate, authorize("ADMIN")];

router.get("/stats",                   ...adminOnly, getStats);
router.get("/users",                   ...adminOnly, listUsers);
router.get("/bookings",                ...adminOnly, listBookings);
router.get("/saccos",                  ...adminOnly, listSaccos);
router.get("/payments",                ...adminOnly, listPayments);
router.patch("/users/:userId/status",  ...adminOnly, updateUserStatus);
router.patch("/saccos/:saccoId/status",...adminOnly, updateSaccoStatus);

export default router;
