import { Router } from "express";
import loginRoute from "./auth.route";
import partnerRoute from "./partners.route";
import productRoute from "./products.route";

const router = Router();

router.use("/auth", loginRoute);
router.use("/products", productRoute);
router.use("/partners", partnerRoute);

export default router;
