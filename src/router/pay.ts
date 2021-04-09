import { Router, Request, Response } from 'express';
import PayController from '../controller/Pay';
import { checkRoleU } from '../middleware/roleUser';
import PaypalSdk = require('paypal-rest-sdk');
import { CheckJwt } from '../middleware/jwt';

PaypalSdk.configure({
    'mode':'sandbox',//sandbox or live
    'client_id': 'AaPEDYf8ahu1pp5C2bmNOI5882b6dBnHaG2e3ZAOf2TvR6p01Ad3v1K2npww4os2O2sbl0tKQbdn5HtT',
    'client_secret': 'EBEvKMxyW2YpshzcQbycRzHJIirGDcvs8tG_u_VD56FWzZzzNOrl_NUcgdI8bSlmvt-g4CKAL8MGANvD'
});
const router = Router();

const pay = PayController;


router.get('/success', [CheckJwt ,checkRoleU(['user'])], pay.PaySuccess);

router.get('/cancel', (req: Request, res: Response)=>res.send('Canceled'))

router.post('/', /*[CheckJwt ,checkRoleU(['user'])],*/ pay.Pay /*(req: Request, res: Response)=>{
//     var payment = {
//         "intent": "sale",
// "payer": {
//     "payment_method": "paypal"
// },
// "redirect_urls": {
//     "return_url": "http://127.0.0.1:3000/success",
//     "cancel_url": "http://127.0.0.1:3000/err"
// },
// "transactions": [{
//     "amount": {
//         "currency": "USD",
//         "total": "25.00"
//     },
//     "description": " a book on mean stack "
// }]
// }
	// call the create Pay method 
    // PaypalSdk.payment.create(payment, function (error, payment) {
    //     if (error) {
    //         throw error;
    //     } else {
    //         for(let i = 0;i < payment.links.length;i++){
    //             if(payment.links[i].rel === 'approval_url'){
    //             res.redirect(payment.links[i].href);
    //             }
    //         }
    //     }
    // });
    }*/);


export default router