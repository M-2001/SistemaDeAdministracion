import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Employee } from "../entity/Employee";
import * as fs from "fs";
import * as path from "path";
import { UploadedFile } from "express-fileupload";
import * as jwt from "jsonwebtoken";

export class EmpleadoController {
	//GetAll Employees
	static getEmpleados = async (_: Request, res: Response) => {
		const empleadoRepo = getRepository(Employee);
		try {
			const empl = await empleadoRepo.find();
			if (empl.length > 0) {
				res.json({ ok: true, empl });
			} else {
				res.json({
					ok: false,
					message: "No se encontraron resultados!",
				});
			}
		} catch (e) {
			res.status(400).json({ message: "Algo ha fallado!" });
		}
	};

	//empleados Paginados
	static MostrarEmpleadosPaginados = async (req: Request, res: Response) => {
		let pagina = req.query.pagina || 1;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const empleadosRepo = getRepository(Employee);
			const [empleados, totalItems] = await empleadosRepo
				.createQueryBuilder("empleado")
				.skip((pagina - 1) * take)
				.take(take)
				.getManyAndCount();

			empleados.map((emp) => {
				delete emp.password;
				delete emp.confirmacionCode;
				delete emp.resetPassword;
				return empleados;
			});

			if (empleados.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number =
					pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					empleados,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
				});
			} else {
				res.json({
					ok: false,
					message: "No se encontraron resultados!",
				});
			}
		} catch (error) {
			return res.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//getEmployeeByID
	static getEmpleadoByID = async (req: Request, res: Response) => {
		const { id } = req.params;
		const employeeRepo = getRepository(Employee);
		try {
			const employee = await employeeRepo.findOneOrFail({
				select: [
					`id`,
					`email`,
					`apellido`,
					`nombre`,
					`codeAccess`,
					`telefono`,
					`direccion`,
					`imagen`,
					"role",
					`estado`,
				],
				where: { id },
			});
			if (employee) {
				res.send({ ok: true, employee });
			}
		} catch (e) {
			res.status(404).json({
				ok: false,
				message: "No hay registros con este id: " + id,
			});
		}
	};

	//Check si el usuario existe
	static checkIfExistUser = async (req: Request, res: Response) => {
		const { code } = req.params;
		const employeeRepo = getRepository(Employee);
		try {
			const employee = await employeeRepo.findOneOrFail({
				select: [`password`, "id"],
				where: { codeAccess: code },
			});
			if (employee.password === "") {
				return res.json({
					ok: true,
					newUser: true,
					userId: employee.id,
				});
			}
			if (employee.password !== "") {
				return res.json({
					ok: true,
					newUser: false,
					userId: employee.id,
				});
			}
		} catch (e) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No hay registros con este codigo: " + code,
				});
		}
	};

	//create new employee de tipo Admin
	static AgregarEmpleadoA = async (req: Request, res: Response) => {
		const { apellido, nombre, code, password } = req.body;
		const token = jwt.sign(
			{ codeAccess: req.body.code },
			process.env.JWTSECRET,
			{ expiresIn: "1h" }
		);

		const empRepo = getRepository(Employee);
		let employee: Employee;
		let verifycationLink: string;

		//buscar e la base de datos si no existen regiatro con el mismo codigo
		const emailExist = await empRepo.findOne({
			where: { codeAccess: code },
		});
		if (emailExist) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Ya existe un regitro con el codigo: " + code,
				});
		}
		//el registro es creado si no existe
		employee = new Employee();
		employee.apellido = apellido;
		employee.nombre = nombre;
		employee.codeAccess = code;
		employee.password = password;
		employee.confirmacionCode = token;

		//validations
		const ValidateOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(employee, ValidateOps);

		if (errors.length > 0) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
		//verificar si el token existe
		try {
			verifycationLink = `https://mye-soporte.vercel.app/confirmRegister/${token}`;
		} catch (e) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo ha fallado!" });
		}

		//TODO: HASH PASSWORD
		try {
			employee.hashPassword();
			await empRepo.save(employee);
			if (employee.id == 1) {
				employee.role = "admin";
				employee.email = process.env.CORREO || " ";
				empRepo.save(employee);
			}
			//all ok
			res.json({
				ok: true,
				message: "Registro creado con exito",
				verifycationLink,
			});
		} catch (e) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo ha fallado!" });
		}
	};

	//delete employee
	static EliminarEmpleado = async (req: Request, res: Response) => {
		const { id } = req.params;
		const empRepo = getRepository(Employee);
		try {
			const empl = await empRepo.findOneOrFail(id);
			await empRepo.delete(empl);
			const imgdir = path.resolve(
				__dirname,
				`../../src/uploads/employee/${empl.imagen}`
			);
			if (fs.existsSync(imgdir)) {
				fs.unlinkSync(imgdir);
			}
			//delete
			res.status(201).json({ ok: true, message: "Empleado eliminado" });
		} catch (e) {
			res.status(404).json({
				ok: false,
				message: "No hay registros con este id: " + id,
			});
		}
	};

	//Editar Employee
	static EditarEmpleado = async (req: Request, res: Response) => {
		let employee: Employee;
		const { id } = req.params;
		const { apellido, nombre, telefono, direccion, email } = req.body;
		const emplRepo = getRepository(Employee);

		try {
			employee = await emplRepo.findOneOrFail(id);
			employee.apellido = apellido;
			employee.nombre = nombre;
			employee.telefono = telefono;
			employee.direccion = direccion;
			employee.email = email;
		} catch (error) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No se han encontrado resultados ",
				});
		}

		const ValidateOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(employee, ValidateOps);

		//try to save employee
		try {
			//all is ok
			await emplRepo.save(employee);
			res.json({ ok: true, message: "El registro se ha actualizado" });
		} catch (error) {
			return res
				.status(409)
				.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//subir imagen perfil
	static ImagenPerfilEmpleado = async (req: Request, res: Response) => {
		const { id } = res.locals.jwtPayload;
		const employeeRepo = getRepository(Employee);
		let employee: Employee;
		if (req.files === undefined || req.files.foto === undefined) {
			return res
				.status(400)
				.json({ ok: false, message: "Ningun archivo selecionando" });
		} else {
			let foto = req.files.foto as UploadedFile;
			let fotoName = foto.name.split(".");
			let ext = fotoName[fotoName.length - 1];
			//extensiones permitidas
			const extFile = ["png", "jpeg", "jpg"];
			if (extFile.indexOf(ext) < 0) {
				return res
					.status(400)
					.json({
						ok: false,
						message:
							"Las estensiones permitidas son " +
							extFile.join(", "),
					});
			} else {
				//cambiar nombre del archivo
				var nombreFoto = `${id}-${new Date().getMilliseconds()}.${ext}`;
				foto.mv(`src/uploads/employee/${nombreFoto}`, (err) => {
					if (err) {
						return res
							.status(500)
							.json({
								ok: false,
								message:
									"Algo salio mal al intentar cargar imagen",
							});
					}
				});
				try {
					const employee = await employeeRepo.findOneOrFail({
						select: [
							`id`,
							`apellido`,
							`nombre`,
							`codeAccess`,
							`telefono`,
							`direccion`,
							`imagen`,
							"role",
							`estado`,
						],
						where: { id },
					});
					const imgdir = path.resolve(
						__dirname,
						`../../src/uploads/employee/${employee.imagen}`
					);
					if (fs.existsSync(imgdir)) {
						fs.unlinkSync(imgdir);
					}
				} catch (e) {
					return res
						.status(404)
						.json({
							ok: false,
							message: "No hay registros con este id: " + id,
						});
				}
				//try to save employee
				try {
					await employeeRepo
						.createQueryBuilder()
						.update(Employee)
						.set({ imagen: nombreFoto })
						.where({ id })
						.execute();
					return res.json({
						ok: true,
						message: "La imagen se ha guardado.",
					});
				} catch (error) {
					return res
						.status(409)
						.json({ ok: false, message: "Algo ha salido mal!" });
				}
			}
		}
	};

	//create new employeeE
	static AgregarEmpleadoE = async (req: Request, res: Response) => {
		const { apellido, nombre, code } = req.body;
		const empRepo = getRepository(Employee);
		const codeExist = await empRepo.findOne({
			where: { codeAccess: code },
		});

		if (codeExist) {
			return res.json({
				ok: false,
				message: "Ya existe un empleado con el codigo : " + code,
			});
		}

		const employee = new Employee();
		employee.apellido = apellido;
		employee.nombre = nombre;
		employee.codeAccess = code;
		employee.password = "";

		//validations
		const ValidateOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(employee, ValidateOps);
		if (errors.length > 0) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal" });
		}
		//try to save employee
		try {
			await empRepo.save(employee);
			//all ok
			res.json({ ok: true, message: "Empleado se creo con exito" });
		} catch (e) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Algo salio mal Intenta nuevamente!",
				});
		}
	};

	//get image employee
	static getImage = (req: Request, res: Response) => {
		const name = req.query.image;
		const imgdir = path.resolve(
			__dirname,
			`../../src/uploads/employee/${name}`
		);
		if (fs.existsSync(imgdir)) {
			res.sendFile(imgdir);
			return;
		}
	};
}
