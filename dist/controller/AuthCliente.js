"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const typeorm_1 = require("typeorm");
const Cliente_1 = require("../entity/Cliente");
const class_validator_1 = require("class-validator");
class AuthClienteController {
}
//login cliente
AuthClienteController.Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!(email && password)) {
        return res.status(400).json({ message: 'username & password are required' });
    }
    const clienteRepository = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = yield clienteRepository.findOneOrFail({ where: { email } });
    }
    catch (e) {
        return res.status(400).json({ message: 'Username or password incorrect!' });
    }
    //check password
    if (!cliente.checkPassword(password)) {
        return res.status(400).json({ message: 'Username or password incorrect' });
    }
    if (cliente.estado == false) {
        res.json({ ok: false, message: ' Acceso Denegado' });
    }
    else {
        const token = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRET, {
            expiresIn: '48h'
        });
        const refreshToken = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRETREFRESH, { expiresIn: '48h' });
        cliente.refreshToken = refreshToken;
        try {
            yield clienteRepository.save(cliente);
            res.json({ message: 'Ok', token: token, refreshToken });
        }
        catch (error) {
            return res.status(400).json({ message: 'somthing goes wrong!' });
        }
    }
});
//passwordChange
AuthClienteController.passwordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
        res.status(400).json({ message: 'Old password and new password are required!' });
    }
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = yield clienteRepo.findOneOrFail(id);
    }
    catch (e) {
        res.status(400).json({ message: 'Something goes wrong! ' });
    }
    if (!cliente.checkPassword(oldPassword)) {
        return res.status(400).json({ message: 'Check your old password ' });
    }
    cliente.password = newPassword;
    const validateOps = { validationError: { target: false, value: false } };
    const error = yield class_validator_1.validate(cliente, validateOps);
    if (error.length > 0) {
        res.status(400).json(error);
    }
    //hash password
    cliente.hashPassword();
    clienteRepo.save(cliente);
    res.json({ message: 'Password changed successfully! ' });
});
//ForgotPassword
AuthClienteController.forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!(email)) {
        return res.status(400).json({ message: 'email is require for change password' });
    }
    const message = 'check your email for a link to reset your password.';
    let verifycationLink;
    let emailStatus = 'Ok';
    const clienteRespo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = yield clienteRespo.findOneOrFail({ where: { email } });
        const token = jwt.sign({ id: cliente.id, email: cliente.email }, process.env.JWTSECRETRESET, { expiresIn: '30m' });
        verifycationLink = `http://localhost:9000/new-password/${token}`;
        cliente.resetPassword = token;
    }
    catch (e) {
        return res.json({ message });
    }
    //TODO: sendEmail
    try {
        // await transporter.sendMail({
        // from : '"Forgot Password " <castlem791@gmail.com>',//sender address
        // to: empl.email,
        // subject: "Forgot Password",
        //html: '<b>Please check on the following link , or paste this into your browser to complete the process:</b>
        //<a href="${verifycationLink}">${verifycationLink}</a>',
        //});
    }
    catch (error) {
        emailStatus = error;
        return res.status(401).json({ message: 'Something goes wrong!' });
    }
    try {
        yield clienteRespo.save(cliente);
    }
    catch (error) {
        emailStatus = error;
        return res.status(400).json({ message: 'Something goes wrong!' });
    }
    res.json({ message, info: emailStatus, verifycationLink });
});
//create new password to reset password
AuthClienteController.createNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword } = req.body;
    const resetPassword = req.headers.reset;
    if (!(resetPassword && newPassword)) {
        res.status(400).json({ message: 'all the fields are require' });
    }
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let jwtPayload;
    let cliente;
    try {
        jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
        cliente = yield clienteRepo.findOneOrFail({ where: { resetPassword } });
    }
    catch (error) {
        return res.status(401).json({ message: 'error' });
    }
    cliente.password = newPassword;
    const validationsOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(cliente, validationsOps);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        cliente.hashPassword();
        yield clienteRepo.save(cliente);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
    res.json({ message: 'password changed!' });
});
//activar usuario
AuthClienteController.ActivarCuenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmacionCode = req.headers.confirm;
    if (!(confirmacionCode)) {
        res.status(400).json({ message: 'all the fields are require' });
    }
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = yield clienteRepo.findOneOrFail({ where: { confirmacionCode } });
    }
    catch (error) {
        return res.status(401).json({ message: 'error' });
    }
    const validationsOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(cliente, validationsOps);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        cliente.estado = true;
        yield clienteRepo.save(cliente);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
    res.json({ message: 'Usuario Activado!' });
});
//refreshToken
AuthClienteController.refreshToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const refreshToken = req.headers.refresh;
    if (!(refreshToken)) {
        res.status(400).json({ message: 'something goes wrong!' });
    }
    ;
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        const verifyResult = jwt.verify(refreshToken, process.env.JWTSECRETREFRESH);
        const { email } = verifyResult;
        console.log(verifyResult);
        cliente = yield clienteRepo.findOneOrFail({ where: { email } });
    }
    catch (error) {
        return res.status(401).json({ message: 'somthing goes wrong!' });
    }
    const token = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRET, { expiresIn: '48h' });
    res.json({ ok: true, token });
});
exports.default = AuthClienteController;
//# sourceMappingURL=AuthCliente.js.map