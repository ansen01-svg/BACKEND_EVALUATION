import { Router } from "express";
import { getPartners } from "../controllers/partners/partnerController";
import { requireAuth } from "../middleware/requireAuth";
import { requireRole } from "../middleware/requireRole";
import { USER_ROLES } from "../utils/constants";

const router = Router();

router.use(requireAuth, requireRole(USER_ROLES.INTERNAL));

router.get("/", getPartners);

export default router;
