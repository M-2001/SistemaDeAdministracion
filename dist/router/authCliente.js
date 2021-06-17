"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthCliente_1 = require("../controller/AuthCliente");
const jwt_1 = require("../middleware/jwt");
const router = express_1.Router();
const auth = AuthCliente_1.default;
//login cliente
router.post('/loginU', auth.Login);
//change password
router.post('/change-password', [jwt_1.CheckJwt], auth.passwordChange);
//forgot password
router.put('/forgot-password', auth.forgotPassword);
//create new password
router.put('/new-password', auth.createNewPassword);
//activarUsuario
router.put('/confirmUser', auth.ActivarCuenta);
//refreshToken
router.post('/refreshToken', auth.refreshToken);
exports.default = router;
//# sourceMappingURL=authCliente.js.map