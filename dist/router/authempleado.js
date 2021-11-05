"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const AuthEmployee_1 = require("../controller/AuthEmployee");
const jwt_1 = require("../middleware/jwt");
const router = express_1.Router();
const auth = AuthEmployee_1.default;
//login Empleado
router.post('/loginEmployee', auth.Login);
router.post('/add-password/:id', auth.addNewPassword);
//change password
router.post('/change-password', [jwt_1.CheckJwt], auth.passwordChange);
//forgot password
router.put('/forgot-password', auth.forgotPassword);
//create new password
router.put('/new-password', auth.createNewPassword);
//activar registro
router.put('/confirmRegister', auth.ActivarCuenta);
exports.default = router;
//# sourceMappingURL=authempleado.js.map