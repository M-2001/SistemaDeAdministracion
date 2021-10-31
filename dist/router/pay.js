"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("dotenv").config();
const express_1 = require("express");
const Pay_1 = require("../controller/Pay");
const PaypalSdk = require("paypal-rest-sdk");
const jwt_1 = require("../middleware/jwt");
PaypalSdk.configure({
    mode: "sandbox",
    client_id: process.env.CLIENT_ID,
    client_secret: process.env.CLIENT_SECRET,
});
const router = express_1.Router();
const pay = Pay_1.default;
router.post("/success", jwt_1.CheckJwt, pay.PaySuccess);
router.get("/cancel", (req, res) => res.send("Canceled"));
router.post("/", jwt_1.CheckJwt, pay.Pay);
exports.default = router;
//# sourceMappingURL=pay.js.map