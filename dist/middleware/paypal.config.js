"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConfigPaypal = void 0;
require("dotenv").config();
const PaypalSdk = require("paypal-rest-sdk");
//configuracion paypal
exports.ConfigPaypal = PaypalSdk.configure({
    'mode': 'sandbox',
    'client_id': process.env.CLIENT_ID,
    'client_secret': process.env.CLIENT_SECRET
});
//# sourceMappingURL=paypal.config.js.map