"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer = require("nodemailer");
exports.transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth: {
        user: 'castlem791@gmail.com',
        pass: 'plbadgpbmtpzhwbp',
    },
    tls: {
        rejectUnauthorized: false
    }
});
exports.transporter.verify().then((connected) => {
    if (connected) {
        console.log('Servidor listo para enviar correos!!!');
    }
    console.log('Sucedio un error al intentar connectar con el servdor de correos!!!');
});
//# sourceMappingURL=mailer.js.map