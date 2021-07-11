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


router.post('/success', CheckJwt, pay.PaySuccess);
router.get('/cancel', (req: Request, res: Response)=>res.send('Canceled'))

router.post('/',CheckJwt, pay.Pay)

export default router