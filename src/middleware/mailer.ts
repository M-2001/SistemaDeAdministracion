import nodemailer = require('nodemailer')

export const  transporter =  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth : {
        user: process.env.CORREO || 'castlem791@gmail.com',
        pass: 'plbadgpbmtpzhwbp',
    },
    tls: {
        rejectUnauthorized: false
    }
});
transporter.verify((err, success) =>{
    err 
    ? console.log('===> Algo salio mal al intentar conectar al servidor de correos')
    : console.log(`===> Servidor listo para enviar emails`);
});