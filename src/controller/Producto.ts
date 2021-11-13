import { validate } from "class-validator";
import { Request, Response, NextFunction } from "express";
import { createQueryBuilder, getRepository } from "typeorm";
import { Producto } from "../entity/Producto";
import { UploadedFile } from "express-fileupload";
import * as path from "path";
import * as fs from "fs";
import { DetalleOrden } from "../entity/Detalles_Orden";
import { Rating } from "../entity/Rating";
import { resolve } from "url";
import { Employee } from "../entity/Employee";
import * as cloudinary from "cloudinary";
import * as dotenv from "dotenv";
dotenv.config();

//const Cloudinary = require('cloudinary').v

cloudinary.v2.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

class ProductoController {
	//mostrar todos los productos

	public getAllProducts = async (): Promise<Producto[]> => {
		try {
			const productoRepo = getRepository(Producto);
			const producto = await productoRepo.find();
			if (producto.length > 0) {
				return producto;
			}
		} catch (error) {
			return [];
		}
	};

	static MostrarProductos = async (req: Request, res: Response) => {
		const search = req.query.search || "";
		const status = Number(req.query.status) || 1;
		try {
			const productoRepo = getRepository(Producto);
			const [productos, _] = await productoRepo
				.createQueryBuilder("producto")
				.leftJoin("producto.proveedor", "prov")
				.addSelect(["prov.nombre_proveedor"])
				.leftJoin("producto.marca", "marca")
				.addSelect(["marca.marca"])
				.leftJoin("producto.categoria", "cat")
				.take(4)
				.addSelect(["cat.categoria"])
				.where("producto.nombreProducto like :name", {
					name: `${search}%`,
				})
				.andWhere("producto.status = :status", {
					status,
				})
				.getManyAndCount();

			if (productos.length > 0) {
				return res.json({ ok: true, productos });
			} else {
				return res.json({
					ok: false,
					message: "No se encontraron resultados",
				});
			}
		} catch (error) {
			return res.json({
				ok: false,
				message: "Algo esta fallando",
				error,
			});
		}
	};

	//mostrar productos paginados
	static ProductosPaginados = async (req: Request, res: Response) => {
		let pagina = req.query.pagina || 1;
		let search = req.query.producto || "";
		let status = req.query.status || 1;
		let price = Number(req.query.price) || 100000000;
		const desc = Number(req.query.desc) || 0;
		let order: "ASC" | "DESC";
		let typeOrder = Number(req.query.order || 0);
		if (typeOrder === 0) {
			order = "ASC";
		} else if (typeOrder === 1) {
			order = "DESC";
		} else {
			order = "ASC";
		}
		pagina = Number(pagina);
		let take = 5;
		take = Number(take);
		try {
			const productoRepo = getRepository(Producto);
			const [producto, totalItems] = await productoRepo
				.createQueryBuilder("producto")
				.innerJoin("producto.marca", "marca")
				.innerJoin("producto.categoria", "categoria")
				.innerJoin("producto.proveedor", "proveedor")
				.addSelect(["proveedor.nombre_proveedor", "proveedor.id"])
				.addSelect(["categoria.categoria", "categoria.id"])
				.addSelect(["marca.marca", "marca.id"])
				.skip((pagina - 1) * take)
				.take(take)
				.where("producto.nombreProducto like :name", {
					name: `%${search}%`,
				})
				.andWhere("producto.costo_standar <= :price", {
					price,
				})
				.andWhere("producto.status = :status", {
					status,
				})
				.andWhere("producto.descuento >= :desc", { desc })
				.orderBy("producto.id", order)
				.getManyAndCount();

			for (let i = 0; i < producto.length; i++) {
				const prod = producto[i];
				if (prod.catidad_por_unidad == 0) {
					prod.status = false;
					productoRepo.save(producto);
				}
			}

			if (producto.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number = pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					producto,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
				});
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

	//mostrar productos por categorias
	static MostrarProductosCategoria = async (req: Request, res: Response) => {
		const categoria = req.query.categoria;
		let price = req.query.price || "";
		let status = req.query.status || "";
		let pagina = req.query.pagina || 1;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const productoRepo = getRepository(Producto);
			const [producto, totalItems] = await productoRepo
				.createQueryBuilder("producto")
				.leftJoin("producto.proveedor", "prov")
				.addSelect(["prov.nombre_proveedor"])
				.leftJoin("producto.marca", "marca")
				.addSelect(["marca.marca"])
				.leftJoin("producto.categoria", "cat")
				.addSelect(["cat.categoria"])
				.skip((pagina - 1) * take)
				.take(take)
				.where({ categoria })
				.andWhere("producto.costo_standar <= :price", {
					price,
				})
				.andWhere("producto.status = :status", {
					status: status,
				})
				.getManyAndCount();

			if (producto.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number = pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					producto,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
				});
			} else {
				res.json({
					ok: false,
					message: "No se encontraron resultados con categoria: " + categoria,
				});
			}
		} catch (error) {
			res.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//mostrar por marca
	static MostrarProductosMarca = async (req: Request, res: Response) => {
		const marca = req.query.marca;
		let price = req.query.price || "";
		let status = req.query.status || "";
		let pagina = req.query.pagina || 1;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const productoRepo = getRepository(Producto);
			const [producto, totalItems] = await productoRepo
				.createQueryBuilder("producto")
				.leftJoin("producto.proveedor", "prov")
				.addSelect(["prov.nombre_proveedor"])
				.leftJoin("producto.categoria", "cat")
				.addSelect(["cat.categoria"])
				.leftJoin("producto.marca", "marca")
				.addSelect(["marca.marca"])
				.skip((pagina - 1) * take)
				.take(take)
				.where({ marca })
				.andWhere("producto.costo_standar <= :price", {
					price,
				})
				.andWhere("producto.status = :status", {
					status: status,
				})
				.getManyAndCount();

			if (producto.length > 0) {
				let totalPages: number = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				let nextPage: number = pagina >= totalPages ? pagina : pagina + 1;
				let prevPage: number = pagina <= 1 ? pagina : pagina - 1;
				res.json({
					ok: true,
					producto,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
				});
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

	//obtener producto por id
	static ObtenerProductoPorID = async (req: Request, res: Response) => {
		const { id } = req.params;
		try {
			const productoRepo = getRepository(Producto);
			const producto = await productoRepo
				.createQueryBuilder("producto")
				.leftJoin("producto.proveedor", "prov")
				.addSelect(["prov.nombre_proveedor"])
				.leftJoin("producto.marca", "marca")
				.addSelect(["marca.marca"])
				.leftJoin("producto.categoria", "cat")
				.addSelect(["cat.categoria"])
				.where({ id })
				.getOneOrFail();

			if (!producto) {
				res.status(400).json({
					ok: false,
					message: "Error al procesar la peticion",
				});
				return;
			}
			res.json({ ok: true, producto });
		} catch (error) {
			return res.status(404).json({
				ok: false,
				message: "No hay registros con este id: " + id,
			});
		}
	};

	//create new product
	static AgregarProducto = async (req: Request, res: Response) => {
		const {
			codigo_producto,
			nombre_producto,
			descripcion,
			proveedor,
			precio,
			cantidadUnidad,
			marca,
			categoria,
		} = req.body;

		const prodRepo = getRepository(Producto);
		const codeProductExist = await prodRepo.findOne({
			where: { codigo_Producto: codigo_producto },
		});
		if (codeProductExist) {
			return res.status(400).json({
				ok: false,
				message: "Ya existe un producto con el codigo " + codigo_producto,
			});
		}

		const producto = new Producto();
		producto.codigo_Producto = codigo_producto;
		producto.nombreProducto = nombre_producto;
		producto.descripcion = descripcion;
		// producto.precioCompra = precioCompra;
		producto.costo_standar = precio;

		producto.catidad_por_unidad = cantidadUnidad;
		producto.proveedor = proveedor;
		producto.marca = marca;
		producto.categoria = categoria;
		producto.status = true;

		//validations
		const ValidateOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(producto, ValidateOps);
		if (errors.length > 0) {
			return res.status(400).json({ ok: false, message: "Algo salio mal!" });
		}
		//try to save a product
		try {
			const nuevoProducto = await prodRepo.save(producto);

			//declaraciones de IVA
			let PorcentajeTotal: number = 1.0;
			let PorcentajeIVA: number = 0.13;
			let TotalIva = PorcentajeTotal + PorcentajeIVA;

			//Actualizar precio producto Con IVA incluido

			const newPriceWithIVA = nuevoProducto.costo_standar * TotalIva;
			const newPrice = newPriceWithIVA.toFixed(2);
			nuevoProducto.costo_standar = parseFloat(newPrice);

			//Intentar guardar el nuevo precio del producto con IVA incluido
			try {
				const newProduct = await prodRepo.save(nuevoProducto);
				//all ok
				res.json({
					ok: true,
					message: "Producto guardado con Exito!",
					newProduct,
				});
			} catch (error) {
				console.log("Error al aplicar IVA!!!");
			}
		} catch (e) {
			res.status(409).json({
				ok: false,
				message: "Algo esta fallando!",
				e,
			});
		}
	};

	//edit a product
	static EditarProducto = async (req: Request, res: Response) => {
		let producto: Producto;
		const { id } = req.params;
		const {
			nombre_producto,
			descripcion,
			descuento,
			costo_standar,
			proveedor,
			marca,
			categoria,
		} = req.body;
		const prodRepo = getRepository(Producto);

		try {
			producto = await prodRepo.findOneOrFail(id);
			producto.nombreProducto = nombre_producto;
			producto.descripcion = descripcion;
			producto.descuento = descuento;
			producto.costo_standar = costo_standar;
			producto.proveedor = proveedor;
			producto.marca = marca;
			producto.categoria = categoria;
		} catch (error) {
			return res
				.status(404)
				.json({ ok: false, message: "No se encontro resultado " });
		}

		const ValidateOps = {
			validationError: { target: false, value: false },
		};
		const errors = await validate(producto, ValidateOps);
		if (errors.length > 0) {
			return res.status(400).json({ ok: false, message: "Algo salio mal!" });
		}
		//try to save producto
		try {
			await prodRepo.save(producto);
			//all ok
			res.json({ ok: true, message: "Producto actualizado con exito!" });
		} catch (error) {
			return res.status(409).json({ ok: true, message: "Algo ha salido mal!" });
		}
	};

	//delete product
	static EliminarProducto = async (req: Request, res: Response) => {
		const { id } = req.params;
		const prodRepo = getRepository(Producto);
		try {
			const producto = await prodRepo.findOneOrFail(id);
			try {
				if (producto.catidad_por_unidad != 0) {
					return res.status(400).json({
						ok: false,
						message: "No se puede eliminar un producto con articulos en stock!",
					});
				}
				//producto.status = false
				await prodRepo.remove(producto);
				const imgdir = path.resolve(
					__dirname,
					`../../src/uploads/productos/${producto.image}`
				);
				if (fs.existsSync(imgdir)) {
					fs.unlinkSync(imgdir);
				}
			} catch (error) {
				return res.send({
					ok: false,
					message:
						"No puedes eliminar este producto porque podria haber registros vinculados",
				});
			}
			//delete
			res.json({ ok: true, message: "Se elimino el producto!" });
		} catch (e) {
			return res.status(404).json({
				ok: false,
				message: "No hay registros con este id: " + id,
			});
		}
	};

	//subir imagen producto
	static ImagenProducto = async (req: Request, res: Response) => {
		const { id } = req.params;
		const productRepo = getRepository(Producto);
		let product: Producto;
		if (req.files === undefined || req.files.foto === undefined) {
			res.status(400).json({
				ok: false,
				message: "Ningun archivo selecionando",
			});
		} else {
			//console.log(req.file.path);
			let foto = req.files.foto as UploadedFile;
			let fotoName = foto.name.split(".");
			let ext = fotoName[fotoName.length - 1];
			//extensiones permitidas
			const extFile = ["png", "jpeg", "jpg", "gif"];
			if (extFile.indexOf(ext) < 0) {
				return res.status(400).json({
					ok: false,
					message: "Las extensiones permitidas son " + extFile.join(", "),
				});
			} else {
				//cambiar nombre del archivo
				var nombreFoto = `${id}-${new Date().getMilliseconds()}.${ext}`;

				foto.mv(`src/uploads/productos/${nombreFoto}`, (err) => {
					if (err) {
						return res.status(500).json({
							ok: false,
							message: "No se ha podido cargar la imagen!",
						});
					}
				});

				let pathImg: any;
				let result: any;
				try {
					product = await productRepo.findOneOrFail(id);
					const imgdir = path.resolve(
						__dirname,
						`../../src/uploads/productos/${product.image}`
					);

					pathImg = path.resolve(
						__dirname,
						`../../src/uploads/productos/${nombreFoto}`
					);
					//console.log(pathImg);
					result = await cloudinary.v2.uploader.upload(pathImg, {
						folder: "productos",
					});

					if (!product.public_id) {
						console.log("Producto nuevo");
					} else {
						const deleteFotoCloud = await cloudinary.v2.uploader.destroy(
							product.public_id
						);
						console.log(deleteFotoCloud);
					}
				} catch (e) {
					res.status(404).json({
						ok: false,
						message: "No hay registros con este id: " + id,
					});
				}
				//try to save product
				try {
					await productRepo
						.createQueryBuilder()
						.update(Producto)
						.set({
							image: result.secure_url,
							public_id: result.public_id,
						})
						.where({ id })
						.execute();
					await fs.unlinkSync(pathImg);
				} catch (error) {
					res.status(409).json({
						ok: false,
						message: "Algo ha salido mal!",
					});
				}
			}
			res.json({ ok: true, message: "La imagen se ha guardado." });
		}
	};

	//eliminar imagen Producto
	static EliminarImagenProducto = async (req: Request, res: Response) => {
		const { id } = req.params;
		const productRepo = getRepository(Producto);
		try {
			const product = await productRepo.findOneOrFail(id);
			//const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${product.image}`);
			if (!product.public_id) {
				console.log("No Image");
			} else {
				const deleteFotoCloud = await cloudinary.v2.uploader.destroy(
					product.public_id
				);
				console.log(deleteFotoCloud);
			}
		} catch (e) {
			return res.status(404).json({
				ok: false,
				message: "No hay registros con este id: " + id,
			});
		}
		//try to save product
		try {
			await productRepo
				.createQueryBuilder()
				.update(Producto)
				.set({ image: "producto.png", public_id: "" })
				.where({ id })
				.execute();
			res.json({ ok: true, message: "imagen de producto eliminada" });
		} catch (error) {
			return res
				.status(409)
				.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//getProductoById
	static getProductoById = async (id: string) => {
		const ordenRepo = getRepository(Producto);
		const producto = await ordenRepo.findOneOrFail(id);
		return producto;
	};

	//estado producto
	static EstadoProducto = async (req: Request, res: Response) => {
		let producto: Producto;
		const id = req.body;
		const proRepo = getRepository(Producto);
		try {
			producto = await proRepo.findOneOrFail(id);

			producto.status = !producto.status;

			await proRepo.save(producto);
			res.json({ ok: true, mesaage: "Estado de producto ha cambiado!" });
		} catch (error) {
			res.json({
				ok: false,
				message: "No se pudo completar la accion solicitada",
			});
		}
	};

	//get image producto
	static getImage = (req: Request, res: Response) => {
		const name = req.query.image;
		const imgdir = path.resolve(
			__dirname,
			`../../src/uploads/productos/${name}`
		);
		if (fs.existsSync(imgdir)) {
			res.sendFile(imgdir);
			return;
		}
	};

	//productos mas vendidos
	static ProductosMasVendidos = async (req: Request, res: Response) => {
		const productoRepo = getRepository(Producto);
		const detalleORepo = getRepository(DetalleOrden);
		let status = Number(req.query.status) || 1;
		let pagina = req.query.pagina || 1;
		const price = Number(req.query.price) || 100000000000;
		pagina = Number(pagina);
		let take = req.query.limit || 5;
		take = Number(take);
		try {
			const [productos, totalItems] = await productoRepo
				.createQueryBuilder("producto")
				.leftJoin("producto.proveedor", "prov")
				.addSelect(["prov.nombre_proveedor"])
				.leftJoin("producto.categoria", "cat")
				.addSelect(["cat.categoria"])
				.leftJoin("producto.marca", "marca")
				.addSelect(["marca.marca"])
				.skip((pagina - 1) * take)
				.andWhere("producto.status = :status", {
					status: status,
				})
				.andWhere("producto.costo_standar <= :price", { price })
				.take(take)
				.getManyAndCount();
			const formated = productos.map(async (pro) => {
				let producto = pro.id;
				const DO = await detalleORepo
					.createQueryBuilder("detalle_orden")
					.innerJoin("detalle_orden.producto", "dto")
					.addSelect(["dto.nombreProducto", "dto.id"])
					.where({ producto })
					.getMany();

				let totalVenta = DO.map((a) => a.cantidad).reduce((a, b) => a + b, 0);
				const newPro = { ...pro, totalVenta };
				return newPro;
			});
			let totalPages: number;
			let nextPage: number;
			let prevPage: number;
			if (productos.length > 0) {
				totalPages = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				nextPage = pagina >= totalPages ? pagina : pagina + 1;
				prevPage = pagina <= 1 ? pagina : pagina - 1;
			}
			Promise.all(formated).then((values) => {
				res.json({
					ok: true,
					values,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
					empty: false,
				});
			});
		} catch (error) {
			return res.status(400).json({ ok: false, message: "Algo ha fallado!" });
		}
	};

	//productos mas ratings
	static ProductosConMasRatings = async (req: Request, res: Response) => {
		const productoRepo = getRepository(Producto);
		const ratingRepo = getRepository(Rating);
		const status = Number(req.query.status) || 1;
		const pagina = Number(req.query.pagina) || 1;
		const price = Number(req.query.price) || 1000000000;
		let take = Number(req.query.limit) || 5;
		try {
			const [productos, totalItems] = await productoRepo
				.createQueryBuilder("producto")
				.leftJoin("producto.proveedor", "prov")
				.addSelect(["prov.nombre_proveedor"])
				.leftJoin("producto.categoria", "cat")
				.addSelect(["cat.categoria"])
				.leftJoin("producto.marca", "marca")
				.addSelect(["marca.marca"])
				.skip((pagina - 1) * take)
				.take(take)
				.getManyAndCount();
			const formated = productos.map(async (pro) => {
				let producto = pro.id;
				const Rating = await ratingRepo
					.createQueryBuilder("rating")
					.innerJoin("rating.producto", "dto")
					.addSelect(["dto.nombreProducto", "dto.id"])
					.where({ producto })
					.andWhere("dto.status = :status", {
						status,
					})
					.andWhere("dto.costo_standar <= :price", { price })
					.getMany();
				let totalRating = Rating.map((a) => a.ratingNumber).reduce(
					(a, b) => a + b,
					0
				);
				const total = totalRating / Rating.length;
				const newPro = { ...pro, total };
				return newPro;
			});
			let totalPages: number;
			let nextPage: number;
			let prevPage: number;
			if (productos.length > 0) {
				totalPages = totalItems / take;
				if (totalPages % 1 !== 0) {
					totalPages = Math.trunc(totalPages) + 1;
				}
				nextPage = pagina >= totalPages ? pagina : pagina + 1;
				prevPage = pagina <= 1 ? pagina : pagina - 1;
			}
			Promise.all(formated).then((values) => {
				res.json({
					ok: true,
					values,
					totalItems,
					totalPages,
					currentPage: pagina,
					nextPage,
					prevPage,
					empty: false,
				});
			});
		} catch (error) {
			return res.status(400).json({ ok: false, message: "Algo ha fallado!" });
		}
	};

	//agregarProductoStock
	static AgregarProductoStock = async (req: Request, res: Response) => {
		const { id } = res.locals.jwtPayload;
		const { idp } = req.params;
		const { cantidadProducto, precioCompra, beneficio } = req.body;

		let producto: Producto;
		let empleado: Employee;

		const productoRepo = getRepository(Producto);
		const empleadoRepo = getRepository(Employee);
		try {
			empleado = await empleadoRepo.findOneOrFail(id);
			let fecha = new Date();
			let getFullDate = fecha.toLocaleString("en-us", {
				weekday: "short",
				day: "numeric",
				month: "long",
				year: "numeric",
				hour: "numeric",
				minute: "2-digit",
				second: "2-digit",
				hour12: true,
			});
			let modificadoPor =
				empleado.nombre +
				" " +
				empleado.apellido +
				` de tipo ${empleado.role}, en la fecha: ${getFullDate}`;
			try {
				//buscar producto
				producto = await productoRepo.findOne(idp);
				if (!producto) {
					return res.status(400).json({
						ok: false,
						message: "No se encontro resultado con el id: " + idp,
					});
				} else {
					//declaracion porcentaje de ganancia mediante el mercado
					let PorcentajeBeneficio = beneficio / 100;

					//declaraciones de IVA
					let PorcentajeTotal: number = 1.0;
					let PorcentajeIVA: number = 0.13;
					let TotalIva = PorcentajeTotal + PorcentajeIVA;

					//generar precio de venta de acuerdo al precio de compra y margen de beneficio

					let porcentaje = 1 - PorcentajeBeneficio;
					let PorcentajeBeno = parseFloat(porcentaje.toFixed(2));

					let CalcPrecioVenta = precioCompra / PorcentajeBeno;
					let costo_standar = parseFloat(CalcPrecioVenta.toFixed(2));

					//Obtener el precio sin IVA para posteriomente aplicar porcentaje de ganancia
					//Intentar guardar cantidad producto
					if (producto.catidad_por_unidad == 0) {
						producto.catidad_por_unidad = cantidadProducto;
						producto.precioCompra = precioCompra;
						producto.costo_standar = costo_standar;
						producto.ActualizadoPor = modificadoPor;
						producto.status = true;

						const Product = await productoRepo.save(producto);

						//Actualizar precio producto Con IVA incluido

						//Intentar guardar el nuevo precio del producto con IVA incluido
						//all ok
						res.json({ ok: true, producto });
					} else {
						res.status(400).json({
							ok: false,
							message: "Aun hay producto en stock",
						});
					}
				}
			} catch (error) {
				console.log(error);
			}
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Administrador no encontrado" });
		}
	};
}
export default ProductoController;
