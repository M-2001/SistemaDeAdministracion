import { Router } from "express";
import AuthClienteController from '../controller/AuthCliente';
import { CheckJwt } from '../middleware/jwt';

const router = Router()
const auth = AuthClienteController;

//login cliente
router.post('/loginU', auth.Login);
//change password
router.post('/change-password', [CheckJwt], auth.passwordChange);
//forgot password
router.put('/forgot-password', auth.forgotPassword);
//create new password
router.put('/new-password', auth.createNewPassword);

//activarUsuario
router.get('/confirmUser', auth.ActivarCuenta);

//refreshToken

router.post('/refreshToken', auth.refreshToken)



export default router;