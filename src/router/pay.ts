require("dotenv").config();
import { Router, Request, Response } from "express";
import PayController from "../controller/Pay";
import { checkRoleU } from "../middleware/roleUser";
import PaypalSdk = require("paypal-rest-sdk");
import { CheckJwt } from "../middleware/jwt";

PaypalSdk.configure({
	mode: "sandbox", //sandbox or live
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
});

const router = Router();

const pay = PayController;

router.post("/success", CheckJwt, pay.PaySuccess);
router.get("/cancel", (req: Request, res: Response) => res.send("Canceled"));

router.post("/", CheckJwt, pay.Pay);

export default router;
