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
const typeorm_1 = require("typeorm");
const Employee_1 = require("../entity/Employee");
const jwt = require("jsonwebtoken");
const class_validator_1 = require("class-validator");
class AuthEmployeeController {
}
AuthEmployeeController.Login = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code, password } = req.body;
    if (!(code && password)) {
        return res.status(400).json({ message: 'code & password are required' });
    }
    const empRepository = typeorm_1.getRepository(Employee_1.Employee);
    let emp;
    try {
        emp = yield empRepository.findOneOrFail({ where: { codeAccess: code } });
    }
    catch (e) {
        return res.status(400).json({ message: 'Code or password incorrect!' });
    }
    //check password
    if (!emp.checkPassword(password)) {
        return res.status(400).json({ message: 'Code or password incorrect' });
    }
    // if(emp.estado == false){
    //     res.json({ok : false, message :'Access denied'});
    // }   
    else {
        const token = jwt.sign({ id: emp.id, code: emp.codeAccess }, process.env.JWTSECRET, {
            expiresIn: '48h'
        });
        res.json({ message: 'Ok', token: token, });
    }
    //const refreshToken = jwt.sign({id: emp.id,username:emp.email}, config.jwtSecretRefresh,{expiresIn : '48h'});
    // user.refreshToken = refreshToken;
    // try {
    //     await empRepository.save(emp);
    // } catch (error) {
    //     return res.status(400).json({message: 'somthing goes wrong!'})
    // }
});
AuthEmployeeController.passwordChange = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
        res.status(400).json({ message: 'Contraseña antigua y nueva son requeridas!' });
    }
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    let empl;
    try {
        empl = yield emplRepo.findOneOrFail(id);
    }
    catch (e) {
        res.status(400).json({ message: 'Algo salio mal! ' });
    }
    if (!empl.checkPassword(oldPassword)) {
        return res.status(400).json({ message: 'Varifica tu contraseña antigua! ' });
    }
    empl.password = newPassword;
    const validateOps = { validationError: { target: false, value: false } };
    const error = yield class_validator_1.validate(empl, validateOps);
    if (error.length > 0) {
        res.status(400).json(error);
    }
    //hash password
    empl.hashPassword();
    emplRepo.save(empl);
    res.json({ message: 'Contraseña cambiada con exito! ' });
});
//ForgotPassword
AuthEmployeeController.forgotPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { code } = req.body;
    if (!(code)) {
        return res.status(400).json({ message: 'Code es requerido para cambiar password' });
    }
    const message = 'check your email for a link to reset your password.';
    let verifycationLink;
    let emailStatus = 'Ok';
    const emplRespo = typeorm_1.getRepository(Employee_1.Employee);
    let empl;
    try {
        empl = yield emplRespo.findOneOrFail({ where: { codeAccess: code } });
        const token = jwt.sign({ id: empl.id, code: empl.codeAccess }, process.env.JWTSECRETRESET, { expiresIn: '30m' });
        verifycationLink = `http://localhost:9000/new-password/${token}`;
        empl.resetPassword = token;
    }
    catch (e) {
        return res.json({ message });
    }
    //TODO: sendEmail
    //try{
    // await transporter.sendMail({
    // from : '"Forgot Password " <castlem791@gmail.com>',//sender address
    // to: empl.email,
    // subject: "Forgot Password",
    //html: '<b>Please check on the following link , or paste this into your browser to complete the process:</b>
    //<a href="${verifycationLink}">${verifycationLink}</a>',
    //});
    // }catch(error){
    //     emailStatus = error;
    //     return res.status(401).json({message:'Something goes wrong!'});
    // }
    try {
        yield emplRespo.save(empl);
    }
    catch (error) {
        emailStatus = error;
        return res.status(400).json({ message: 'Something goes wrong!' });
    }
    res.json({ message, info: emailStatus, verifycationLink });
});
//resetPassword
AuthEmployeeController.createNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { newPassword } = req.body;
    const resetPassword = req.headers.reset;
    if (!(resetPassword && newPassword)) {
        res.status(400).json({ message: 'all the fields are require' });
    }
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    let jwtPayload;
    let empl;
    try {
        jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
        empl = yield emplRepo.findOneOrFail({ where: { resetPassword } });
    }
    catch (error) {
        return res.status(401).json({ message: 'error' });
    }
    empl.password = newPassword;
    const validationsOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(empl, validationsOps);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        empl.hashPassword();
        yield emplRepo.save(empl);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
    res.json({ message: 'password changed!' });
});
//activar cuenta administrador
AuthEmployeeController.ActivarCuenta = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const confirmacionCode = req.headers.confirm;
    if (!(confirmacionCode)) {
        res.status(400).json({ message: 'all the fields are require' });
    }
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    let employee;
    try {
        employee = yield emplRepo.findOneOrFail({ where: { confirmacionCode } });
    }
    catch (error) {
        return res.status(401).json({ message: 'error' });
    }
    const validationsOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(employee, validationsOps);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        employee.estado = true;
        yield emplRepo.save(employee);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
    res.json({ message: 'Registro Activado!' });
});
exports.default = AuthEmployeeController;
//# sourceMappingURL=AuthEmployee.js.map