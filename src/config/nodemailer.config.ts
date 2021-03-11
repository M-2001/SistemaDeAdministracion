import nodemailer = require('nodemailer')

export const  transporter =  nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    auth : {
        user: 'castlem791@gmail.com',
        pass: 'plbadgpbmtpzhwbp',
    },
});
transporter.verify().then(()=>{
    console.log('Ready to send Email');
})