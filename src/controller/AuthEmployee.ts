import { getRepository } from "typeorm";
import { Employee } from "../entity/Employee";
import { Request, Response } from "express";
import * as jwt from "jsonwebtoken";
import { validate } from "class-validator";
import { transporter } from "../middleware/mailer";
import { json } from "body-parser";

class AuthEmployeeController {
	//login employee
	static Login = async (req: Request, res: Response) => {
		const { code, password } = req.body;
		if (!(code && password)) {
			return res
				.status(400)
				.json({ ok: false, message: "code & password are required" });
		}
		const empRepository = getRepository(Employee);
		let emp: Employee;
		try {
			emp = await empRepository.findOneOrFail({
				where: { codeAccess: code },
			});
		} catch (e) {
			return res.send({
				ok: false,
				message: "Code or password incorrect!",
			});
		}
		//check password
		if (!emp.checkPassword(password)) {
			return res.send({
				ok: false,
				message: "Code or password incorrect",
			});
		}

		if (emp.estado == false) {
			return res.json({ ok: false, message: "Acceso Denegado" });
		} else {
			const token = jwt.sign(
				{ id: emp.id, code: emp.codeAccess, role: emp.role },
				process.env.JWTSECRET,
				{
					expiresIn: "48h",
				}
			);
			res.json({ ok: true, token });
		}
	};

	static passwordChange = async (req: Request, res: Response) => {
		const { id } = res.locals.jwtPayload;
		const { oldPassword, newPassword } = req.body;
		if (!(oldPassword && newPassword)) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Contraseña antigua y nueva son requeridas!",
				});
		}
		const emplRepo = getRepository(Employee);
		let empl: Employee;
		try {
			empl = await emplRepo.findOneOrFail(id);
		} catch (e) {
			res.status(400).json({ ok: false, message: "Algo salio mal! " });
		}
		if (!empl.checkPassword(oldPassword)) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Varifica tu contraseña antigua! ",
				});
		}
		empl.password = newPassword;
		const validateOps = {
			validationError: { target: false, value: false },
		};
		const error = await validate(empl, validateOps);
		if (error.length > 0) {
			res.status(400).json({ ok: false, message: "Algo esta fallando" });
		}
		//hash password
		empl.hashPassword();
		emplRepo.save(empl);
		res.json({ ok: true, message: "Contraseña cambiada con exito! " });
	};

	//ForgotPassword
	static forgotPassword = async (req: Request, res: Response) => {
		const { email } = req.body;
		if (!email) {
			return res
				.status(400)
				.json({
					message: "El correo es requerido para cambiar password",
				});
		}
		const message = "hemos enviado lo necesario a tu correo";
		let verifycationLink;
		let emailStatus = "Ok";
		let token: string;
		const emplRespo = getRepository(Employee);
		let empl: Employee;

		try {
			empl = await emplRespo.findOneOrFail({ where: { email: email } });
			token = jwt.sign(
				{ id: empl.id, code: empl.codeAccess },
				process.env.JWTSECRETRESET,
				{ expiresIn: "30m" }
			);
			verifycationLink = `https://mye-soporte.vercel.app/reset-password/${token}`;
		} catch (e) {
			return res.json({
				ok: false,
				message: "no se encontro to correo en los registros",
			});
		}
		//TODO: sendEmail
		try {
			let email = process.env.CORREO;
			await transporter.sendMail({
				from: ` "Forgot Password " <${email}> `, //sender address
				to: empl.email,
				subject: "Forgot Password",
				html: `<b>Por favor, consulte el siguiente enlace o peguelo en su navegador para completar el proceso y poder restaurar su contraseña: </b>
                <a href="${verifycationLink}">${verifycationLink}</a>`,
			});
		} catch (error) {
			emailStatus = error;
			return res
				.status(401)
				.json({ ok: false, message: "Algo salio mal!!" });
		}
		try {
			empl.resetPassword = token;
			await emplRespo.save(empl);
		} catch (error) {
			emailStatus = error;
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
		res.json({ ok: true, message, emailStatus });
	};

	//resetPassword
	static createNewPassword = async (req: Request, res: Response) => {
		const { newPassword } = req.body;
		const resetPassword = req.headers.reset as string;
		if (!(resetPassword && newPassword)) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Todos los campos son requeridos!",
				});
		}
		const emplRepo = getRepository(Employee);
		let jwtPayload;
		let empl: Employee;
		try {
			empl = await emplRepo.findOneOrFail({ where: { resetPassword } });
			jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
		} catch (error) {
			return res
				.status(401)
				.json({ ok: false, message: "No se ah completado la accion" });
		}
		empl.password = newPassword;

		const validationsOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(empl, validationsOps);

		if (errors.length > 0) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal" });
		}
		try {
			empl.hashPassword();
			await emplRepo.save(empl);
		} catch (error) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Algo esta fallando, intenta nuevamente",
				});
		}
		res.json({ ok: true, message: "password changed!" });
	};

	//activar cuenta administrador
	static ActivarCuenta = async (req: Request, res: Response) => {
		const confirmacionCode = req.headers.confirm as string;
		if (!confirmacionCode) {
			res.status(400).json({
				ok: false,
				message: "Todos los campos son requeridos",
			});
		}
		const emplRepo = getRepository(Employee);
		let employee: Employee;
		try {
			employee = await emplRepo.findOneOrFail({
				where: { confirmacionCode },
			});
		} catch (error) {
			return res
				.status(401)
				.json({ ok: false, message: "Alho esta fallando!" });
		}

		const validationsOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(employee, validationsOps);

		if (errors.length > 0) {
			return res
				.status(400)
				.json({ ok: false, message: "algo salio mal!" });
		}
		try {
			employee.estado = true;
			await emplRepo.save(employee);
		} catch (error) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Algo esta fallando, intenta nuevamente!",
				});
		}
		res.json({ ok: true, message: "Registro Activado!" });
	};

	//agregar contreña cuenta empleado
	static addNewPassword = async (req: Request, res: Response) => {
		const id = req.params;
		const { password } = req.body;
		let employee: Employee;
		const emplRepo = getRepository(Employee);
		try {
			employee = await emplRepo.findOneOrFail(id);
			if (employee) {
				employee.password = password;
				employee.hashPassword();
				await emplRepo.save(employee);
				return res.send({
					ok: true,
					message: "Se guardo la contraseña",
				});
			}
		} catch (error) {
			return res
				.status(400)
				.json({
					ok: false,
					message: " Algo esta fallando, intenta nuevamente!",
				});
		}
	};
}
export default AuthEmployeeController;
