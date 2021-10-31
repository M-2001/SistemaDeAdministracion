import { Request, Response } from "express";
import * as cloudinary from "cloudinary";
import { getRepository } from "typeorm";
import { Producto } from "../entity/Producto";
import { UploadedFile } from "express-fileupload";
import * as path from "path";
import * as fs from "fs";
import { Galeria } from "../entity/Galeria";

cloudinary.v2.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

export class GaleriaController {
	//agregar galeria
	static AgregarGaleria = async (req: Request, res: Response) => {
		const { productID } = req.params;
		const productRepo = getRepository(Producto);
		const galleryRepo = getRepository(Galeria);
		let product: Producto;
		let GalleryImages: number;

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
					message:
						"Las extensiones permitidas son " + extFile.join(", "),
				});
			} else {
				try {
					product = await productRepo.findOneOrFail(productID);
				} catch (error) {
					return res.status(404).json({
						ok: false,
						message: "No hay registros con este id: " + productID,
					});
				}

				try {
					let producto = product.id;
					GalleryImages = await galleryRepo
						.createQueryBuilder("galeria")
						.innerJoin("galeria.producto", "producto")
						.addSelect("producto.id")
						.where({ producto })
						.getCount();
				} catch (error) {
					return;
				}

				if (GalleryImages < 3) {
					//cambiar nombre del archivo
					var nombreFoto = `${productID}-${new Date().getMilliseconds()}.${ext}`;

					foto.mv(`src/uploads/gallery/${nombreFoto}`, (err) => {
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
						const imgdir = path.resolve(
							__dirname,
							`../../src/uploads/gallery/${product.image}`
						);

						pathImg = path.resolve(
							__dirname,
							`../../src/uploads/gallery/${nombreFoto}`
						);
						result = await cloudinary.v2.uploader.upload(pathImg, {
							folder: "gallery",
						});
					} catch (e) {
						await fs.unlinkSync(pathImg);
						return res.status(404).json({
							ok: false,
							message:
								"Ocurrio un error al intertar subir la imagen a la nube!",
						});
					}
					//try to save product

					try {
						const gallery = new Galeria();
						(gallery.imagen = result.secure_url),
							(gallery.producto = product),
							(gallery.public_id = result.public_id);

						await galleryRepo.save(gallery);

						await fs.unlinkSync(pathImg);
					} catch (error) {
						res.status(409).json({
							ok: false,
							message: "Algo ha salido mal!",
						});
					}
				} else {
					return res.json({
						ok: false,
						message:
							"Numero de imagenes en galeria por producto llego al limite!",
					});
				}
			}
			res.json({ ok: true, message: "La imagen se ha guardado." });
		}
	};

	//mostrar galleria
	static MostrarGaleria = async (req: Request, res: Response) => {
		const { productID } = req.params;
		const productRepo = getRepository(Producto);
		const galleryRepo = getRepository(Galeria);
		let product: Producto;
		let GalleryImages: Galeria[];

		try {
			product = await productRepo.findOneOrFail(productID);
		} catch (error) {
			return res.json({
				ok: false,
				message: `No se encontro resultado con id: ${productID}`,
			});
		}

		try {
			let producto = product.id;
			GalleryImages = await galleryRepo
				.createQueryBuilder("galeria")
				.innerJoin("galeria.producto", "producto")
				.addSelect(["producto.id"])
				.where({ producto })
				.getMany();

			GalleryImages.length > 0
				? res.json({ ok: true, GalleryImages })
				: res.json({
						ok: false,
						message: "Aun no hay galeria para este producto!",
				  });
		} catch (error) {
			return res.json({ ok: false, message: "Algo salio mal!" });
		}
	};

	//remover imagen galeria
	static RemoverImagenGaleria = async (req: Request, res: Response) => {
		const { galleryID } = req.params;
		const GalleryRepo = getRepository(Galeria);
		let Gallery: Galeria;
		//req.params == undefined || req.params == null ? res.send('hola soy un error') : res.send(productID);

		try {
			Gallery = await GalleryRepo.findOneOrFail({
				where: { id: galleryID },
			});
		} catch (error) {
			return res.json({
				ok: false,
				message: `Galeria con el id: ${galleryID} no encontrada!`,
			});
		}

		if (Gallery.public_id) {
			const deleteFotoCloud = await cloudinary.v2.uploader.destroy(
				Gallery.public_id
			);
		}

		try {
			let id = Gallery.id;
			await GalleryRepo.remove(Gallery);
			res.json({ ok: true, message: "Registro eliminado!" });
		} catch (error) {
			return res
				.status(409)
				.json({ ok: false, message: "Algo ha salido mal!" });
		}
	};

	//remover imagen galeria
	static ActualizarImagenGaleria = async (req: Request, res: Response) => {
		const { galleryID } = req.params;
		const GalleryRepo = getRepository(Galeria);
		let Gallery: Galeria;

		const galleryRepo = getRepository(Galeria);

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
					message:
						"Las extensiones permitidas son " + extFile.join(", "),
				});
			} else {
				try {
					Gallery = await GalleryRepo.findOneOrFail({
						where: { id: galleryID },
					});
				} catch (error) {
					return res.status(404).json({
						ok: false,
						message: "No hay registros con este id: " + galleryID,
					});
				}

				//cambiar nombre del archivo
				var nombreFoto = `${galleryID}-${new Date().getMilliseconds()}.${ext}`;

				foto.mv(`src/uploads/gallery/${nombreFoto}`, (err) => {
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
					const imgdir = path.resolve(
						__dirname,
						`../../src/uploads/gallery/${Gallery.imagen}`
					);

					pathImg = path.resolve(
						__dirname,
						`../../src/uploads/gallery/${nombreFoto}`
					);
					result = await cloudinary.v2.uploader.upload(pathImg, {
						folder: "gallery",
					});
				} catch (e) {
					await fs.unlinkSync(pathImg);
					return res.status(404).json({
						ok: false,
						message:
							"Ocurrio un error al intertar subir la imagen a la nube!",
					});
				}
				//try to save product

				try {
					let id = Gallery.id;
					await galleryRepo
						.createQueryBuilder()
						.update(Galeria)
						.set({
							imagen: result.secure_url,
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
			res.json({ ok: true, message: "La imagen se Actualizado." });
		}
	};
}
