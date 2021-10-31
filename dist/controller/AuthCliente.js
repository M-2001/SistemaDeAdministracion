"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
const typeorm_1 = require("typeorm");
const Cliente_1 = require("../entity/Cliente");
const class_validator_1 = require("class-validator");
const mailer_1 = require("../middleware/mailer");
class AuthClienteController {
}
//login cliente
AuthClienteController.Login = async (req, res) => {
    const { email, password } = req.body;
    if (!(email && password)) {
        return res
            .status(400)
            .json({ message: "username & password are required" });
    }
    const clienteRepository = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = await clienteRepository.findOneOrFail({
            where: { email },
        });
    }
    catch (e) {
        return res
            .status(400)
            .json({
            ok: false,
            message: "Username or password incorrect!",
        });
    }
    //check password
    if (!cliente.checkPassword(password)) {
        return res
            .status(400)
            .json({ ok: false, message: "Username or password incorrect" });
    }
    if (cliente.estado == false) {
        return res.json({ ok: false, message: " Acceso Denegado" });
    }
    else {
        const token = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRET, {
            expiresIn: "48h",
        });
        const refreshToken = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRETREFRESH, { expiresIn: "48h" });
        cliente.refreshToken = refreshToken;
        try {
            await clienteRepository.save(cliente);
            res.json({ ok: true, token: token, refreshToken });
        }
        catch (error) {
            return res
                .status(400)
                .json({ ok: false, message: "Algo salio mal!" });
        }
    }
};
//passwordChange
AuthClienteController.passwordChange = async (req, res) => {
    const { id } = res.locals.jwtPayload;
    const { oldPassword, newPassword } = req.body;
    if (!(oldPassword && newPassword)) {
        res.status(400).json({
            ok: false,
            message: "Old password and new password are required!",
        });
    }
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = await clienteRepo.findOneOrFail(id);
    }
    catch (e) {
        res.status(400).json({ ok: false, message: "ALgo salio mal! " });
    }
    if (!cliente.checkPassword(oldPassword)) {
        return res
            .status(400)
            .json({ ok: false, message: "Check your old password " });
    }
    cliente.password = newPassword;
    const validateOps = {
        validationError: { target: false, value: false },
    };
    const error = await class_validator_1.validate(cliente, validateOps);
    if (error.length > 0) {
        res.status(400).json({
            ok: false,
            message: "Algo esta fallando, intenta nuevamente!",
        });
    }
    //hash password
    cliente.hashPassword();
    clienteRepo.save(cliente);
    res.json({ ok: true, message: "Password changed successfully! " });
};
//ForgotPassword
AuthClienteController.forgotPassword = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res
            .status(400)
            .json({
            ok: false,
            message: "email is require for change password",
        });
    }
    const message = "check your email for a link to reset your password.";
    let verifycationLink;
    let emailStatus = "Ok";
    const clienteRespo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = await clienteRespo.findOneOrFail({ where: { email } });
        if (!cliente) {
            return res.send({
                ok: false,
                message: "No se encontro resultado!",
            });
        }
        const token = jwt.sign({ id: cliente.id, email: cliente.email }, process.env.JWTSECRETRESET, { expiresIn: "30m" });
        verifycationLink = `https://client-mye-soporte.vercel.app/reset-password/${token}`;
        cliente.resetPassword = token;
    }
    catch (e) {
        return res.json({ ok: false, message: "Algo esta fallando!" });
    }
    //TODO: sendEmail
    try {
        let email = process.env.CORREO;
        await mailer_1.transporter.sendMail({
            from: `"Forgot Password " <${email}>`,
            to: cliente.email,
            subject: "Forgot Password",
            html: `<b>Por favor, consulte el siguiente enlace o peguelo en su navegador para completar el proceso y restaurar sun contraseña: </b>
            <a href="${verifycationLink}">${verifycationLink}</a>`,
        });
    }
    catch (error) {
        emailStatus = error;
        return res
            .status(401)
            .json({ ok: false, message: "Algo salio mal" });
    }
    try {
        await clienteRespo.save(cliente);
    }
    catch (error) {
        emailStatus = error;
        return res
            .status(400)
            .json({ ok: false, message: "Algo salio mal!" });
    }
    res.json({ ok: true, message });
};
//create new password to reset password
AuthClienteController.createNewPassword = async (req, res) => {
    const { newPassword } = req.body;
    const resetPassword = req.headers.reset;
    console.log(newPassword, resetPassword);
    if (!(resetPassword && newPassword)) {
        res.status(400).json({
            ok: false,
            message: "Faltan datos importantes",
        });
    }
    let jwtPayload;
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = await clienteRepo.findOneOrFail({
            where: { resetPassword },
        });
        jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
    }
    catch (error) {
        return res
            .status(401)
            .json({ ok: false, message: "No se ah completado la accion" });
    }
    cliente.password = newPassword;
    const validationsOps = {
        validationError: { target: false, value: false },
    };
    const errors = await class_validator_1.validate(cliente, validationsOps);
    if (errors.length > 0) {
        return res
            .status(400)
            .json({ ok: false, message: "Algo esta mal!" });
    }
    try {
        cliente.hashPassword();
        await clienteRepo.save(cliente);
    }
    catch (error) {
        return res
            .status(400)
            .json({
            ok: false,
            message: "Algo sigue fallando, intenta nuevamente!",
        });
    }
    res.json({ ok: true, message: "Se actualizo tu contraseña" });
};
//activar usuario
AuthClienteController.ActivarCuenta = async (req, res) => {
    const confirmacionCode = req.headers.confirm;
    console.log(req.query);
    if (!confirmacionCode) {
        res.status(400).json({
            ok: false,
            message: "Todos los campos son requeridos!",
        });
    }
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        cliente = await clienteRepo.findOneOrFail({
            where: { confirmacionCode },
        });
    }
    catch (error) {
        return res
            .status(401)
            .json({ ok: false, message: "ALgo esta saliendo mal!" });
    }
    const validationsOps = {
        validationError: { target: false, value: false },
    };
    const errors = await class_validator_1.validate(cliente, validationsOps);
    if (errors.length > 0) {
        return res
            .status(400)
            .json({ ok: false, message: "Algo esta fallando!" });
    }
    try {
        cliente.estado = true;
        await clienteRepo.save(cliente);
        res.json({ ok: true, message: "Usuario Activado!" });
    }
    catch (error) {
        return res.status(400).json({ message: error });
    }
};
//refreshToken
AuthClienteController.refreshToken = async (req, res) => {
    const refreshToken = req.headers.refresh;
    if (!refreshToken) {
        res.status(400).json({ ok: false, message: "Algo salio mal!" });
    }
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    try {
        const verifyResult = jwt.verify(refreshToken, process.env.JWTSECRETREFRESH);
        const { email } = verifyResult;
        console.log(verifyResult);
        cliente = await clienteRepo.findOneOrFail({ where: { email } });
    }
    catch (error) {
        return res
            .status(401)
            .json({ ok: false, message: "Algo ha fallado!" });
    }
    const token = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRET, { expiresIn: "48h" });
    res.json({ ok: true, token });
};
exports.default = AuthClienteController;
//# sourceMappingURL=AuthCliente.js.map