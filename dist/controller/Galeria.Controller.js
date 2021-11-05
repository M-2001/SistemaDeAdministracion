"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.GaleriaController = void 0;
const cloudinary = require("cloudinary");
const typeorm_1 = require("typeorm");
const Producto_1 = require("../entity/Producto");
const path = require("path");
const fs = require("fs");
const Galeria_1 = require("../entity/Galeria");
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
class GaleriaController {
}
exports.GaleriaController = GaleriaController;
_a = GaleriaController;
//agregar galeria
GaleriaController.AgregarGaleria = async (req, res) => {
    const { productID } = req.params;
    const productRepo = (0, typeorm_1.getRepository)(Producto_1.Producto);
    const galleryRepo = (0, typeorm_1.getRepository)(Galeria_1.Galeria);
    let product;
    let GalleryImages;
    if (req.files === undefined || req.files.foto === undefined) {
        res.status(400).json({
            ok: false,
            message: "Ningun archivo selecionando",
        });
    }
    else {
        //console.log(req.file.path);
        let foto = req.files.foto;
        let fotoName = foto.name.split(".");
        let ext = fotoName[fotoName.length - 1];
        //extensiones permitidas
        const extFile = ["png", "jpeg", "jpg", "gif"];
        if (extFile.indexOf(ext) < 0) {
            return res.status(400).json({
                ok: false,
                message: "Las extensiones permitidas son " + extFile.join(", "),
            });
        }
        else {
            try {
                product = await productRepo.findOneOrFail(productID);
            }
            catch (error) {
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
            }
            catch (error) {
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
                let pathImg;
                let result;
                try {
                    const imgdir = path.resolve(__dirname, `../../src/uploads/gallery/${product.image}`);
                    pathImg = path.resolve(__dirname, `../../src/uploads/gallery/${nombreFoto}`);
                    result = await cloudinary.v2.uploader.upload(pathImg, {
                        folder: "gallery",
                    });
                }
                catch (e) {
                    await fs.unlinkSync(pathImg);
                    return res.status(404).json({
                        ok: false,
                        message: "Ocurrio un error al intertar subir la imagen a la nube!",
                    });
                }
                //try to save product
                try {
                    const gallery = new Galeria_1.Galeria();
                    (gallery.imagen = result.secure_url),
                        (gallery.producto = product),
                        (gallery.public_id = result.public_id);
                    await galleryRepo.save(gallery);
                    await fs.unlinkSync(pathImg);
                }
                catch (error) {
                    res.status(409).json({
                        ok: false,
                        message: "Algo ha salido mal!",
                    });
                }
            }
            else {
                return res.json({
                    ok: false,
                    message: "Numero de imagenes en galeria por producto llego al limite!",
                });
            }
        }
        res.json({ ok: true, message: "La imagen se ha guardado." });
    }
};
//mostrar galleria
GaleriaController.MostrarGaleria = async (req, res) => {
    const { productID } = req.params;
    const productRepo = (0, typeorm_1.getRepository)(Producto_1.Producto);
    const galleryRepo = (0, typeorm_1.getRepository)(Galeria_1.Galeria);
    let product;
    let GalleryImages;
    try {
        product = await productRepo.findOneOrFail(productID);
    }
    catch (error) {
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
    }
    catch (error) {
        return res.json({ ok: false, message: "Algo salio mal!" });
    }
};
//remover imagen galeria
GaleriaController.RemoverImagenGaleria = async (req, res) => {
    const { galleryID } = req.params;
    const GalleryRepo = (0, typeorm_1.getRepository)(Galeria_1.Galeria);
    let Gallery;
    //req.params == undefined || req.params == null ? res.send('hola soy un error') : res.send(productID);
    try {
        Gallery = await GalleryRepo.findOneOrFail({
            where: { id: galleryID },
        });
    }
    catch (error) {
        return res.json({
            ok: false,
            message: `Galeria con el id: ${galleryID} no encontrada!`,
        });
    }
    if (Gallery.public_id) {
        const deleteFotoCloud = await cloudinary.v2.uploader.destroy(Gallery.public_id);
    }
    try {
        let id = Gallery.id;
        await GalleryRepo.remove(Gallery);
        res.json({ ok: true, message: "Registro eliminado!" });
    }
    catch (error) {
        return res
            .status(409)
            .json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//remover imagen galeria
GaleriaController.ActualizarImagenGaleria = async (req, res) => {
    const { galleryID } = req.params;
    const GalleryRepo = (0, typeorm_1.getRepository)(Galeria_1.Galeria);
    let Gallery;
    const galleryRepo = (0, typeorm_1.getRepository)(Galeria_1.Galeria);
    if (req.files === undefined || req.files.foto === undefined) {
        res.status(400).json({
            ok: false,
            message: "Ningun archivo selecionando",
        });
    }
    else {
        //console.log(req.file.path);
        let foto = req.files.foto;
        let fotoName = foto.name.split(".");
        let ext = fotoName[fotoName.length - 1];
        //extensiones permitidas
        const extFile = ["png", "jpeg", "jpg", "gif"];
        if (extFile.indexOf(ext) < 0) {
            return res.status(400).json({
                ok: false,
                message: "Las extensiones permitidas son " + extFile.join(", "),
            });
        }
        else {
            try {
                Gallery = await GalleryRepo.findOneOrFail({
                    where: { id: galleryID },
                });
            }
            catch (error) {
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
            let pathImg;
            let result;
            try {
                const imgdir = path.resolve(__dirname, `../../src/uploads/gallery/${Gallery.imagen}`);
                pathImg = path.resolve(__dirname, `../../src/uploads/gallery/${nombreFoto}`);
                result = await cloudinary.v2.uploader.upload(pathImg, {
                    folder: "gallery",
                });
            }
            catch (e) {
                await fs.unlinkSync(pathImg);
                return res.status(404).json({
                    ok: false,
                    message: "Ocurrio un error al intertar subir la imagen a la nube!",
                });
            }
            //try to save product
            try {
                let id = Gallery.id;
                await galleryRepo
                    .createQueryBuilder()
                    .update(Galeria_1.Galeria)
                    .set({
                    imagen: result.secure_url,
                    public_id: result.public_id,
                })
                    .where({ id })
                    .execute();
                await fs.unlinkSync(pathImg);
            }
            catch (error) {
                res.status(409).json({
                    ok: false,
                    message: "Algo ha salido mal!",
                });
            }
        }
        res.json({ ok: true, message: "La imagen se Actualizado." });
    }
};
//# sourceMappingURL=Galeria.Controller.js.map