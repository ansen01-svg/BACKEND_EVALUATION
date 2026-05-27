import { Router } from "express";
import loginRoute from "./auth.route";

const router = Router();

router.use("/auth", loginRoute);

export default router;
