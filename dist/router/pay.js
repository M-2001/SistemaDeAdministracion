"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Pay_1 = require("../controller/Pay");
const PaypalSdk = require("paypal-rest-sdk");
const jwt_1 = require("../middleware/jwt");
PaypalSdk.configure({
    'mode': 'sandbox',
    'client_id': 'AaPEDYf8ahu1pp5C2bmNOI5882b6dBnHaG2e3ZAOf2TvR6p01Ad3v1K2npww4os2O2sbl0tKQbdn5HtT',
    'client_secret': 'EBEvKMxyW2YpshzcQbycRzHJIirGDcvs8tG_u_VD56FWzZzzNOrl_NUcgdI8bSlmvt-g4CKAL8MGANvD'
});
const router = express_1.Router();
const pay = Pay_1.default;
router.post('/success', jwt_1.CheckJwt, pay.PaySuccess);
router.get('/cancel', (req, res) => res.send('Canceled'));
router.post('/', jwt_1.CheckJwt, pay.Pay);
exports.default = router;
//# sourceMappingURL=pay.js.map