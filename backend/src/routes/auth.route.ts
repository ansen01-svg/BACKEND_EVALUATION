import { Router } from "express";
import { getProfile, login, logout } from "../controllers/auth/authController";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", login);
router.get("/account", requireAuth, getProfile);
router.post("/logout", requireAuth, logout);

export default router;
