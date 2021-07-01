"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Employee_1 = require("../entity/Employee");
const jwt = require("jsonwebtoken");
const class_validator_1 = require("class-validator");
const mailer_1 = require("../middleware/mailer");
class AuthEmployeeController {
}
AuthEmployeeController.Login = async (req, res) => {
    const { code, password } = req.body;
    if (!(code && password)) {
        return res.status(400).json({ message: 'code & password are required' });
    }
    const empRepository = typeorm_1.getRepository(Employee_1.Employee);
    let emp;
    try {
        emp = await empRepository.findOneOrFail({ where: { codeAccess: code } });
    }
    catch (e) {
        return res.send({ message: 'Code or password incorrect!', ok: false });
    }
    //check password
    if (!emp.checkPassword(password)) {
        return res.send({ message: 'Code or password incorrect', ok: false });
    }
    if (emp.estado == false) {
        return res.json({ ok: false, message: 'Access Denegado' });
    }
    else {
        const token = jwt.sign({ id: emp.id, code: emp.codeAccess, role: emp.role }, process.env.JWTSECRET, {
            expiresIn: '48h'
        });
        res.json({ message: 'Ok', token: token, ok: true /*refreshToken,*/ });
    }
    //const refreshToken = jwt.sign({id: emp.id,username:emp.email}, config.jwtSecretRefresh,{expiresIn : '48h'});
    // user.refreshToken = refreshToken;
    // try {
    //     await empRepository.save(emp);
    // } catch (error) {
    //     return res.status(400).json({message: 'somthing goes wrong!'})
    // }
};
AuthEmployeeController.passwordChange = async (req, res) => {
    const { id } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
        res.status(400).json({ message: 'Contraseña antigua y nueva son requeridas!' });
    }
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    let empl;
    try {
        empl = await emplRepo.findOneOrFail(id);
    }
    catch (e) {
        res.status(400).json({ message: 'Algo salio mal! ' });
    }
    if (!empl.checkPassword(oldPassword)) {
        return res.status(400).json({ message: 'Varifica tu contraseña antigua! ' });
    }
    empl.password = newPassword;
    const validateOps = { validationError: { target: false, value: false } };
    const error = await class_validator_1.validate(empl, validateOps);
    if (error.length > 0) {
        res.status(400).json(error);
    }
    //hash password
    empl.hashPassword();
    emplRepo.save(empl);
    res.json({ message: 'Contraseña cambiada con exito! ' });
};
//ForgotPassword
AuthEmployeeController.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!(email)) {
        return res.status(400).json({ message: 'El correo es requerido para cambiar password' });
    }
    const message = 'hemos enviado lo necesario a tu correo';
    let verifycationLink;
    let emailStatus = 'Ok';
    let token;
    const emplRespo = typeorm_1.getRepository(Employee_1.Employee);
    let empl;
    try {
        empl = await emplRespo.findOneOrFail({ where: { email: email } });
        token = jwt.sign({ id: empl.id, code: empl.codeAccess }, process.env.JWTSECRETRESET, { expiresIn: '30m' });
        verifycationLink = `https://systempcs.herokuapp.com/api/reset-password/${token}`;
    }
    catch (e) {
        return res.json({ ok: false, message: 'no se encontro to correo en los registros' });
    }
    //TODO: sendEmail
    try {
        await mailer_1.transporter.sendMail({
            from: '"Forgot Password " <castlem791@gmail.com>',
            to: empl.email,
            subject: "Forgot Password",
            html: `<b>Please check on the following link , or paste this into your browser to complete the process:</b>
                <a href="${verifycationLink}">${verifycationLink}</a>`,
        });
    }
    catch (error) {
        emailStatus = error;
        return res.status(401).json({ message: 'Something goes wrong!' });
    }
    try {
        empl.resetPassword = token;
        await emplRespo.save(empl);
    }
    catch (error) {
        emailStatus = error;
        return res.status(400).json({ message: 'Something goes wrong!' });
    }
    res.json({ message, ok: true, emailStatus });
};
//resetPassword
AuthEmployeeController.createNewPassword = async (req, res) => {
    const { newPassword } = req.body;
    const resetPassword = req.headers.reset;
    if (!(resetPassword && newPassword)) {
        return res.status(400).json({ message: 'all the fields are require' });
    }
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    let jwtPayload;
    let empl;
    try {
        empl = await emplRepo.findOneOrFail({ where: { resetPassword } });
        jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
        console.log(empl);
    }
    catch (error) {
        return res.status(401).json({ message: 'No se ah completado la accion' });
    }
    empl.password = newPassword;
    const validationsOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(empl, validationsOps);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        empl.hashPassword();
        await emplRepo.save(empl);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
    res.json({ message: 'password changed!', ok: true });
};
//activar cuenta administrador
AuthEmployeeController.ActivarCuenta = async (req, res) => {
    const confirmacionCode = req.headers.confirm;
    if (!(confirmacionCode)) {
        res.status(400).json({ message: 'all the fields are require' });
    }
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    let employee;
    try {
        employee = await emplRepo.findOneOrFail({ where: { confirmacionCode } });
    }
    catch (error) {
        return res.status(401).json({ message: 'error' });
    }
    const validationsOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(employee, validationsOps);
    if (errors.length > 0) {
        return res.status(400).json({ error: errors });
    }
    try {
        employee.estado = true;
        await emplRepo.save(employee);
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
    res.json({ message: 'Registro Activado!' });
};
AuthEmployeeController.addNewPassword = async (req, res) => {
    const id = req.params;
    const { password } = req.body;
    let employee;
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    try {
        employee = await emplRepo.findOneOrFail(id);
        if (employee) {
            employee.password = password;
            employee.hashPassword();
            await emplRepo.save(employee);
            return res.send({ message: "Se guardo la contraseña", ok: true });
        }
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
};
exports.default = AuthEmployeeController;
//# sourceMappingURL=AuthEmployee.js.map