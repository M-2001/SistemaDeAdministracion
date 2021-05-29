"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const nodemailer = require("nodemailer");
exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'castlem791@gmail.com',
        pass: 'plbadgpbmtpzhwbp',
    },
});
exports.transporter.verify().then(() => {
    console.log('Ready to send Email');
});
//# sourceMappingURL=nodemailer.config.js.map