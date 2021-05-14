import * as jwt from 'jsonwebtoken';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { Cliente } from '../entity/Cliente';
import { validate } from 'class-validator';
import { Employee } from '../entity/Employee';
import { transporter } from '../config/nodemailer.config';

class AuthClienteController {

    //login cliente
    static Login = async (req: Request, res: Response) => {
        const { email, password } = req.body;
        if (!(email && password)) {
            return res.status(400).json({ message: 'username & password are required' });
        }
        const clienteRepository = getRepository(Cliente);
        let cliente: Cliente;
        try {
            cliente = await clienteRepository.findOneOrFail({ where: { email } });
        }
        catch (e) {
            return res.status(400).json({ message: 'Username or password incorrect!' })
        }
        //check password
        if (!cliente.checkPassword(password)) {
            return res.status(400).json({ message: 'Username or password incorrect' });
        }

        if (cliente.estado == false) {
            res.json({ ok: false, message: ' Acceso Denegado' });
        } else {
            const token = jwt.sign({ clienteid: cliente.id, email: cliente.email }, process.env.JWTSECRET, {
                expiresIn: '48h'
            });
            res.json({ message: 'Ok', token: token, /*refreshToken,*/ });
        }

        //const refreshToken = jwt.sign({id: emp.id,username:emp.email}, config.jwtSecretRefresh,{expiresIn : '48h'});

        // user.refreshToken = refreshToken;
        // try {
        //     await empRepository.save(emp);
        // } catch (error) {
        //     return res.status(400).json({message: 'somthing goes wrong!'})
        // }
    };

    //passwordChange
    static passwordChange = async (req: Request, res: Response) => {
        const { id } = res.locals.jwtPayload;
        const { oldPassword, newPassword } = req.body;
        if (!(oldPassword && newPassword)) {
            res.status(400).json({ message: 'Old password and new password are required!' });
        }
        const clienteRepo = getRepository(Cliente);
        let cliente: Cliente;
        try {
            cliente = await clienteRepo.findOneOrFail(id)
        }
        catch (e) {
            res.status(400).json({ message: 'Something goes wrong! ' });
        }
        if (!cliente.checkPassword(oldPassword)) {
            return res.status(400).json({ message: 'Check your old password ' });
        }
        cliente.password = newPassword;
        const validateOps = { validationError: { target: false, value: false } };
        const error = await validate(cliente, validateOps);
        if (error.length > 0) {
            res.status(400).json(error)
        }
        //hash password
        cliente.hashPassword();
        clienteRepo.save(cliente);
        res.json({ message: 'Password changed successfully! ' });
    };
    //ForgotPassword
    static forgotPassword = async (req: Request, res: Response) => {
        const { email } = req.body;
        if (!(email)) {
            return res.status(400).json({ message: 'email is require for change password' });
        }
        const message = 'check your email for a link to reset your password.';
        let verifycationLink;
        let emailStatus = 'Ok';

        const clienteRespo = getRepository(Cliente);
        let cliente: Cliente;

        try {
            cliente = await clienteRespo.findOneOrFail({ where: { email } });
            if(!cliente){
                return res.send({ ok:false })
            }
            const token = jwt.sign({ id: cliente.id, email: cliente.email }, process.env.JWTSECRETRESET, { expiresIn: '30m' });
            verifycationLink = `http://localhost:3000/reset-password/${token}`;
            cliente.resetPassword = token;

        } catch (e) {
            return res.json({ message });
        }
        //TODO: sendEmail
        try {
            await transporter.sendMail({
            from : '"Forgot Password " <castlem791@gmail.com>',//sender address
            to: cliente.email,
            subject: "Forgot Password",
            html: `<b>Please check on the following link , or paste this into your browser to complete the process:</b>
            <a href="${verifycationLink}">${verifycationLink}</a>`,
            });
        } catch (error) {
            emailStatus = error;
            return res.status(401).json({ message: 'Something goes wrong!' });
        }
        try {
            await clienteRespo.save(cliente);
        } catch (error) {
            emailStatus = error;
            return res.status(400).json({ message: 'Something goes wrong!' })
        }
        res.json({ message, info: emailStatus });
    };
    //create new password to reset password
    static createNewPassword = async (req: Request, res: Response) => {
        const { newPassword } = req.body;
        const resetPassword = req.headers.reset as string;
        if (!(resetPassword && newPassword)) {
            res.status(400).json({ message: 'all the fields are require' });
        }
        const clienteRepo = getRepository(Cliente);
        let jwtPayload;
        let cliente: Cliente;
        try {
            jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
            cliente = await clienteRepo.findOneOrFail({ where: { resetPassword } });

        } catch (error) {
            return res.status(401).json({ message: 'error' })
        }
        cliente.password = newPassword;

        const validationsOps = { validationError: { target: false, value: false } };
        const errors = await validate(cliente, validationsOps);

        if (errors.length > 0) {
            return res.status(400).json({ error: errors })
        }
        try {
            cliente.hashPassword();
            await clienteRepo.save(cliente);

        } catch (error) {
            return res.status(400).json({ message: error });
        }
        res.json({ message: 'password changed!' })
    }

    //activar usuario
    static ActivarCuenta = async (req: Request, res: Response) => {
        const confirmacionCode = req.headers.confirm as string;
        console.log(req.query)
        if (!(confirmacionCode)) {
            res.status(400).json({ message: 'all the fields are require' });
        }
        const clienteRepo = getRepository(Cliente);
        let cliente: Cliente;
        try {
            cliente = await clienteRepo.findOneOrFail({ where: { confirmacionCode } });

        } catch (error) {
            return res.status(401).json({ message: 'error' })
        }

        const validationsOps = { validationError: { target: false, value: false } };
        const errors = await validate(cliente, validationsOps);

        if (errors.length > 0) {
            return res.status(400).json({ error: errors })
        }
        try {
            cliente.estado = true
            await clienteRepo.save(cliente);

        } catch (error) {
            return res.status(400).json({ message: error });
        }
        res.json({ message: 'Usuario Activado!', ok: true })
    };
}

export default AuthClienteController;