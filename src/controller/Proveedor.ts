import { validate } from "class-validator";
import { Request, Response } from "express";
import { Proveedor } from "../entity/Proveedor";
import { getRepository } from "typeorm";
import { Producto } from "../entity/Producto";

class ProveedorController {
	//Mostrar proveedores
	static MostrarProveedors = async (_: Request, res: Response) => {
		try {
			const proveedorRepo = getRepository(Proveedor);
			const proveedor = await proveedorRepo.find({
				where: { status: true },
			});
			if (proveedor.length > 0) {
				res.json({ ok: true, proveedor });
			} else {
				res.json({
					ok: false,
					message: "No se encontraron resultados",
				});
			}
		} catch (error) {
			res.json({ ok: false, message: "Algo ha salido mal" });
		}
	};

	//Mostrar proveedores paginados
	static MostrarProveedoresPaginados = async (
		req: Request,
		res: Response
	) => {
		let pagina = req.query.pagina || 1;
		let provider = req.query.proveedor || "";
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const proveedoresRepo = getRepository(Proveedor);
			const [proveedores, totalItems] = await proveedoresRepo
				.createQueryBuilder("proveedor")
				.skip((pagina - 1) * take)
				.take(take)
				.where("proveedor.nombre_proveedor like :name", {
					name: `%${provider}%`,
				})
				.getManyAndCount();
			if (proveedores.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number =
					pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					proveedores,
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
			res.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//Agregar un nuevo proveedor
	static AgregarProveedor = async (req: Request, res: Response) => {
		const { nombre, email, telefono, direccion } = req.body;
		try {
			const proveedorRepo = getRepository(Proveedor);
			const proveedorExist = await proveedorRepo.findOne({
				where: { nombre_proveedor: nombre },
			});

			if (proveedorExist) {
				return res
					.status(400)
					.json({
						ok: false,
						message: "Ya existe una proveedor con ese nombre",
					});
			}
			const proveedor = new Proveedor();
			proveedor.nombre_proveedor = nombre;
			proveedor.email = email;
			proveedor.telefono = telefono;
			proveedor.direccion = direccion;

			//validations
			const ValidateOps = {
				validationError: { target: false, value: false },
			};
			const errors = await validate(proveedor, ValidateOps);

			if (errors.length > 0) {
				return res.status(400).json({ ok: false, errors });
			}
			await proveedorRepo.save(proveedor);
			//all ok
			res.json({ ok: true, message: "Se agrego un nuevo proveedor" });
		} catch (error) {
			res.status(400).json({ ok: false, message: "Algo ha salio mal!" });
		}
	};

	//Obtener proveedor por ID
	static ObtenerProveedorPorID = async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			const proveedorRepo = getRepository(Proveedor);
			const proveedor = await proveedorRepo.findOneOrFail({
				where: { id },
			});
			res.json({ ok: true, proveedor });
		} catch (error) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No hay registros con este id: " + id,
				});
		}
	};

	//Actualizar un proveedor
	static ActualizarProveedor = async (req: Request, res: Response) => {
		let proveedor;
		const { id } = req.params;
		const { nombre, email, telefono, direccion } = req.body;
		const proveedorRepo = getRepository(Proveedor);
		try {
			proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
			(proveedor.nombre_proveedor = nombre),
				(proveedor.email = email),
				(proveedor.telefono = telefono),
				(proveedor.direccion = direccion);
		} catch (error) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No se han encontrado resultados con el id: " + id,
				});
		}
		const ValidateOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(proveedor, ValidateOps);
		//Try to save data Category
		try {
			await proveedorRepo.save(proveedor);
			//all is ok
			res.json({ ok: true, message: "Se actualizo el registro!" });
		} catch (error) {
			return res
				.status(409)
				.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//eliminar un proveedor
	static EliminarProveedor = async (req: Request, res: Response) => {
		let proveedor: Proveedor;
		const { id } = req.params;
		const proveedorRepo = getRepository(Proveedor);
		try {
			proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
		} catch (error) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No se han encontrado resultados ",
				});
		}
		//intentar eliminar proveedor
		try {
			await proveedorRepo.remove(proveedor);
			//all is ok
			res.json({ ok: true, meassge: "Proveedor ha sido eliminado!" });
		} catch (error) {
			return res.send({
				ok: false,
				message:
					"No puedes eliminar este proveedor porque hay registros implicados",
			});
		}
	};

	//Cambiar estado proveedor
	static EstadoProveedor = async (req: Request, res: Response) => {
		let proveedor: Proveedor;
		const id = req.body;
		const proveedorRepo = getRepository(Proveedor);
		const productoRepo = getRepository(Producto);
		try {
			proveedor = await proveedorRepo.findOneOrFail(id);
		} catch (error) {
			return res.json({
				ok: false,
				message: `Proveedor con el id: ${req.body.id} no encontrada!!!`,
			});
		}

		try {
			const [productos, totalResult] = await productoRepo.findAndCount({
				where: { proveedor: proveedor },
			});
			if (totalResult > 0) {
				return res
					.status(300)
					.json({
						ok: false,
						message: `Advertencia: No se puede modificar el estado con el id: ${proveedor.id} porque tiene registros asociados!`,
					});
			} else {
				if (proveedor.status == true) {
					proveedor.status = false;
				} else {
					proveedor.status = true;
				}
				const proveedorStatus = await proveedorRepo.save(proveedor);
				return res.json({
					ok: true,
					message: "Estado de proveedor actualizado!",
				});
			}
		} catch (error) {
			return res.json({
				ok: false,
				message: "Sucedio un error Inesperado!!!",
			});
		}
	};
}
export default ProveedorController;
