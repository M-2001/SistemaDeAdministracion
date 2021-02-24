import nodemailer = require('nodemailer')

export const  transporter =  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth : {
        user: 'castlem791@gmail.com',
        pass: 'plbadgpbmtpzhwbp',
    },
    tls: {
        rejectUnauthorized: false
    }
});
transporter.verify().then(()=>{
    console.log('Ready to send Email');
})