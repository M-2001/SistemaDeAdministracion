"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer = require("nodemailer");
exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.CORREO || 'castlem791@gmail.com',
        pass: 'plbadgpbmtpzhwbp',
    },
    tls: {
        rejectUnauthorized: false
    }
});
exports.transporter.verify((err, success) => {
    err
        ? console.log('===> Algo salio mal al intentar conectar al servidor de correos')
        : console.log(`===> Servidor listo para enviar emails`);
});
//# sourceMappingURL=mailer.js.map