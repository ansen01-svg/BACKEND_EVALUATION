import { Router } from "express";
import {
  addEvent,
  createProduct,
  getProduct,
  listProducts,
  verifyProduct,
} from "../controllers/product/productController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { USER_ROLES } from "../utils/constants";

const router = Router();
router.use(requireAuth);

router.get("/", listProducts);
router.post("/", requireRole(USER_ROLES.INTERNAL), createProduct);
router.get("/:id", getProduct);
router.post("/:id/events", requireRole(USER_ROLES.INTERNAL), addEvent);
router.get(
  "/:id/verify",
  requireRole(USER_ROLES.INTERNAL, USER_ROLES.PARTNER),
  verifyProduct as any,
);

export default router;
