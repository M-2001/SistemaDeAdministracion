import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Cupon } from "../entity/Cupones";
import { Cliente } from "../entity/Cliente";
import { transporter } from "../middleware/mailer";

class CuponController {
	//crear cupon de descuento
	static CrearCupon = async (req: Request, res: Response) => {
		let newCupon;
		try {
			const cuponRepo = getRepository(Cupon);
			let date = new Date();
			let month = date.getMonth() + 1;
			const codigoCupon = Math.floor(Math.random() * 90000) + 10000;
			const codigo = "SYSTEM_PC-" + codigoCupon + month;

			const { descuento, fechaExp } = req.body;

			const cupon = new Cupon();
			(cupon.codigo = codigo),
				(cupon.descuento = descuento),
				(cupon.fechaExp = new Date(fechaExp));

			newCupon = await cuponRepo.save(cupon);
			//all is ok
			res.json({ ok: true, message: "Cupon Creado con exito!" });
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
	};

	//cambiar estado cupon
	static EstadoCupon = async (req: Request, res: Response) => {
		let cupon: Cupon;
		const id = req.body;
		const cuponRepo = getRepository(Cupon);
		try {
			cupon = await cuponRepo.findOneOrFail(id);

			cupon.status = !cupon.status;

			await cuponRepo.save(cupon);
			res.json({ ok: true, message: "Estado de cupon actualizado!" });
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
	};

	//mostrar cupones
	static MostrarCupones = async (req: Request, res: Response) => {
		let cupon;
		const cuponRepo = getRepository(Cupon);
		try {
			cupon = await cuponRepo.findAndCount();

			if (cupon.length > 0) {
				res.json({ ok: true, cupon });
			} else {
				res.json({
					ok: false,
					message: " No se encontraron resultados",
				});
			}
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
	};

	//mostrar cupones Pajinados
	static MostrarCuponesPaginados = async (req: Request, res: Response) => {
		let pagina = req.query.pagina || 1;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const cuponRepo = getRepository(Cupon);
			const [cupones, totalItems] = await cuponRepo.findAndCount({
				take,
				skip: (pagina - 1) * take,
			});
			if (cupones.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number =
					pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					cupones,
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
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
	};
	//eliminar Cupon
	static EliminarCupon = async (req: Request, res: Response) => {
		let cupon;
		const { id } = req.body;
		const cuponRepo = getRepository(Cupon);
		try {
			cupon = await cuponRepo.findOneOrFail({ where: { id } });
		} catch (error) {
			return res
				.status(404)
				.json({ message: "No se han encontrado resultados " });
		}
		//Try to delete Category
		try {
			await cuponRepo.remove(cupon);
			res.json({ ok: true, message: "Cupon ha sido eliminado!" });
		} catch (error) {
			return res.status(409).json({ message: "Algo ha salido mal!" });
		}
	};

	//enviar Cupon
	static SendCupon = async (req: Request, res: Response) => {
		const cuponRepo = getRepository(Cupon);
		const clienteRepo = getRepository(Cliente);
		const email = req.body.email;
		let CODIGO_CUPON = req.query.CODIGO_CUPON;
		let cuponExist: Cupon;
		let cliente: Cliente;
		//bus
		try {
			if (CODIGO_CUPON) {
				try {
					cuponExist = await cuponRepo.findOneOrFail({
						where: { codigo: CODIGO_CUPON },
					});
					if (cuponExist.status == true) {
						return res
							.status(400)
							.json({
								ok: false,
								message:
									"El cupón con el codigo: " +
									CODIGO_CUPON +
									" , ya ha sido utilizado!!!",
							});
					} else {
						try {
							cliente = await clienteRepo.findOne({
								where: { email },
							});
							if (!cliente) {
								return res
									.status(400)
									.json({
										ok: true,
										message:
											"El cliente con el email: " +
											email +
											" no existe!!!",
									});
							}
						} catch (error) {
							return res
								.status(400)
								.json({
									ok: false,
									message: "Algo salio mal!",
								});
						}

						//Try send email
						try {
							let subject: string = ` ${
								cliente.nombre +
								" " +
								cliente.apellido +
								" , Por ser cliente especial !!!"
							} `;
							await transporter.sendMail({
								from: `"System-PC Sonsonate" <castlem791@gmail.com>`, //sender address
								to: cliente.email,
								subject: subject,
								html: ` <!DOCTYPE html>
                                <html lang="en">
                                <head> </head>
                                <body><div>
                                <h3>Felicidades !!! Por ser cliente especial te regalamos un cupon de descuento en el total de tu compra</h3>
                                <p>Aplica tu cupón con un ${
									cuponExist.descuento
								}% de descuento en tu compra total!!! </p>
                                <p>Codigo Cupon: ${cuponExist.codigo}</p>
                                <p>${
									cliente.nombre + " " + cliente.apellido
								}, este Cupón solo es valido para ti, si lo compartes ya no sera valido</p>

                                <a href="${"Link tienda"}">Visitanos pronto !!!</a>
                                </div>
                                </body>
                                </html>`,
							});
							res.json({
								ok: true,
								message: "Email enviado con exito!!!",
							});
						} catch (error) {
							return res
								.status(400)
								.json({
									ok: false,
									message: "Algo salio mal!",
								});
						}
					}
				} catch (error) {
					return res
						.status(400)
						.json({
							ok: false,
							message:
								"El cupón con el codigo: " +
								CODIGO_CUPON +
								" no es valido!!!",
						});
				}
			} else {
				return res
					.status(405)
					.json({
						ok: false,
						message: "Debe enviar un codigo de cupon!!!",
					});
			}
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
	};

	//mostrar cupon
	static MostrarCupon = async (req: Request, res: Response) => {
		const codeCoupon = req.query.code;
		const cpRepo = getRepository(Cupon);
		let cuponExist: Cupon;
		try {
			cuponExist = await cpRepo.findOneOrFail({
				where: { codigo: codeCoupon },
			});
			if (new Date(cuponExist.fechaExp).getTime() < Date.now()) {
				return res.send({ ok: false, message: "Cupon expirado" });
			}
			if (cuponExist.status == true) {
				return res.send({
					ok: false,
					message: "Este cupon ya fue utilizado",
				});
			} else {
				return res.send({ ok: true });
			}
		} catch (error) {
			return res
				.status(400)
				.json({
					ok: false,
					message:
						"El cupón con el codigo: " +
						codeCoupon +
						" no es valido!!!",
				});
		}
	};
}
export default CuponController;
