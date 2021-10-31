import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Rating } from "../entity/Rating";
class RatingController {
	//Agregar rating a producto
	static AgregarRating = async (req: Request, res: Response) => {
		const { clienteid } = res.locals.jwtPayload;
		const { productoId, ratingNumber, titulo, comentario } = req.body;
		const ratingRepo = getRepository(Rating);

		const rating = new Rating();

		rating.ratingNumber = ratingNumber;
		rating.titulo = titulo;
		rating.comentario = comentario;
		rating.producto = productoId;
		rating.cliente = clienteid;

		//try so save rating
		try {
			await ratingRepo.save(rating);
			//all is ok
			res.json({ ok: true, message: "Rating agregado con exito" });
		} catch (error) {
			return res.status(400).json({ message: "Algo salio mal!" });
		}
	};

	//mostrar rating paginados
	static MostrarRating = async (req: Request, res: Response) => {
		let pagina = req.query.pagina || 0;
		pagina = Number(pagina);
		let take = req.query.limit || 10;
		take = Number(take);
		try {
			const ratingRepo = getRepository(Rating);
			const rating =
				await ratingRepo.query(` select r.id, r.ratingNumber, r.titulo, r.comentario, p.nombreProducto, c.apellido, c.nombre
            from rating r inner join producto p on r.productoId = p.id inner join cliente c on r.clienteId = c.id limit ${take} offset ${pagina} `);
			// producto.map(prod =>{
			//     delete prod.proveedor.email;
			//     delete prod.proveedor.telefono;
			//     delete prod.proveedor.direccion;
			//     delete prod.proveedor.status;
			//     delete prod.marca.status;
			//     delete prod.categoria.status;
			//     return producto
			// });
			if (rating.length > 0) {
				res.json({ ok: true, rating });
			} else {
				res.json({
					ok: false,
					message: "No se encontraron resultados",
				});
			}
		} catch (error) {
			return res.json({ ok: false, message: "Algo ha salido mal" });
		}
	};

	//Mostrar rating pajinado
	static MostrarRatingPaginados = async (req: Request, res: Response) => {
		let pagina = req.query.pagina || 1;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const ratingsRepo = getRepository(Rating);
			const [ratings, totalItems] = await ratingsRepo
				.createQueryBuilder("rating")
				.innerJoin("rating.cliente", "cliente")
				.innerJoin("rating.producto", "producto")
				.addSelect(["cliente.nombre", "cliente.apellido"])
				.addSelect(["producto.nombreProducto"])
				.skip((pagina - 1) * take)
				.take(take)
				.getManyAndCount();

			if (ratings.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 == 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number =
					pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					ratings,
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
				.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//Mostrar rating por producto
	static MostrarRatingPorProducto = async (req: Request, res: Response) => {
		const producto = req.query.id;
		let pagina = req.query.pagina || 1;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const ratingsRepo = getRepository(Rating);
			const [ratings, totalItems] = await ratingsRepo
				.createQueryBuilder("rating")
				.innerJoin("rating.cliente", "cliente")
				.innerJoin("rating.producto", "producto")
				.addSelect([
					"cliente.nombre",
					"cliente.apellido",
					"cliente.imagen",
					"cliente.id",
				])
				.addSelect(["producto.nombreProducto"])
				.skip((pagina - 1) * take)
				.take(take)
				.where({ producto })
				.getManyAndCount();

			if (ratings.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number =
					pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					ratings,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
				});
			} else {
				res.json({
					ok: false,
					message: "No se encontraron productos!",
				});
			}
		} catch (error) {
			return res.status(400).json({ message: "Algo ha salido mal!" });
		}
	};

	//Actualizar rating realizados por el usuario logado
	static ActualizarRating = async (req: Request, res: Response) => {
		let rating;
		const { clienteid } = res.locals.jwtPayload;
		const { id } = req.params;
		const { ratingNumber, titulo, comentario } = req.body;
		const ratingRepo = getRepository(Rating);
		try {
			rating = await ratingRepo
				.createQueryBuilder("rating")
				.leftJoin("rating.cliente", "rc")
				.addSelect(["rc.id", "rc.nombre", "rc.apellido"])
				.where({ id })
				.getOneOrFail();

			(rating.ratingNumber = ratingNumber),
				(rating.titulo = titulo),
				(rating.comentario = comentario);

			console.log(rating);
			if (rating.cliente.id === clienteid) {
				await ratingRepo.save(rating);
				res.json({ ok: true, message: "Rating actualizado" });
			} else {
				return res.json({
					ok: false,
					message: "No puedes modificar este rating",
				});
			}
		} catch (error) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No se han encontrado resultados con el id: " + id,
				});
		}
	};

	//eliminar ratin hechos por el usuario logado
	static EliminarRating = async (req: Request, res: Response) => {
		let rating;
		const { clienteid } = res.locals.jwtPayload;
		const { id } = req.params;
		const ratingRepo = getRepository(Rating);
		try {
			rating = await ratingRepo
				.createQueryBuilder("rating")
				.leftJoin("rating.cliente", "rc")
				.addSelect(["rc.id", "rc.nombre", "rc.apellido"])
				.where({ id })
				.getOneOrFail();

			console.log(rating);
			if (rating.cliente.id === clienteid) {
				await ratingRepo.delete(id);
				res.json({ ok: true, message: "Rating Eliminado!" });
			} else {
				return res.json({
					ok: false,
					message: "No puedes eliminar rating de otros usuarios",
				});
			}
		} catch (error) {
			return res
				.status(404)
				.json({
					ok: false,
					message: "No se han encontrado resultados con el id: " + id,
				});
		}
	};

	//mostrar rating id
	static RatingPorId = async (req: Request, res: Response) => {
		let rating;
		const { id } = req.params;
		try {
			const ratingRepo = getRepository(Rating);
			rating =
				await ratingRepo.query(` select r.id, r.ratingNumber, r.titulo, r.comentario, p.nombreProducto, c.apellido, c.nombre
            from rating r
            inner join producto p on r.productoId = p.id inner join cliente c on r.clienteId = c.id
            where r.id = '${id}'`);

			if (rating.length > 0) {
				res.json({ ok: true, rating });
			} else {
				res.json({
					ok: false,
					message: "No se encontraron resultados con el id: " + id,
				});
			}
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo ha salido mal" });
		}
	};
}
export default RatingController;
