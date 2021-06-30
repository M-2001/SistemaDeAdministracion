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
transporter.verify().then((connected)=>{
    if (connected) {
        console.log('Servidor listo para enviar correos!!!');
    }
    console.log('Sucedio un error al intentar connectar con el servdor de correos!!!');
})