"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Producto_1 = require("../entity/Producto");
const path = require("path");
const fs = require("fs");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
const Rating_1 = require("../entity/Rating");
const Employee_1 = require("../entity/Employee");
const cloudinary = require("cloudinary");
const dotenv = require("dotenv");
dotenv.config();
//const Cloudinary = require('cloudinary').v
cloudinary.v2.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET,
});
class ProductoController {
    constructor() {
        //mostrar todos los productos
        this.getAllProducts = async () => {
            try {
                const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
                const producto = await productoRepo.find();
                if (producto.length > 0) {
                    return producto;
                }
            }
            catch (error) {
                return [];
            }
        };
    }
}
ProductoController.MostrarProductos = async (req, res) => {
    const search = req.query.search || "";
    const status = Number(req.query.status) || 1;
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
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
        }
        else {
            return res.json({
                ok: false,
                message: "No se encontraron resultados",
            });
        }
    }
    catch (error) {
        return res.json({
            ok: false,
            message: "Algo esta fallando",
            error,
        });
    }
};
//mostrar productos paginados
ProductoController.ProductosPaginados = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let search = req.query.producto || "";
    let status = req.query.status || 1;
    let price = Number(req.query.price) || 100000000;
    const desc = Number(req.query.desc) || 0;
    let order;
    let typeOrder = Number(req.query.order || 0);
    if (typeOrder === 0) {
        order = "ASC";
    }
    else if (typeOrder === 1) {
        order = "DESC";
    }
    else {
        order = "ASC";
    }
    pagina = Number(pagina);
    let take = 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
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
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                producto,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados",
            });
        }
    }
    catch (error) {
        res.json({ ok: false, message: "Algo ha salido mal" });
    }
};
//mostrar productos por categorias
ProductoController.MostrarProductosCategoria = async (req, res) => {
    const categoria = req.query.categoria;
    let price = req.query.price || "";
    let status = req.query.status || "";
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
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
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                producto,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados con categoria: " + categoria,
            });
        }
    }
    catch (error) {
        res.json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//mostrar por marca
ProductoController.MostrarProductosMarca = async (req, res) => {
    const marca = req.query.marca;
    let price = req.query.price || "";
    let status = req.query.status || "";
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
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
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                producto,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados",
            });
        }
    }
    catch (error) {
        res.json({ ok: false, message: "Algo ha salido mal" });
    }
};
//obtener producto por id
ProductoController.ObtenerProductoPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
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
    }
    catch (error) {
        return res.status(404).json({
            ok: false,
            message: "No hay registros con este id: " + id,
        });
    }
};
//create new product
ProductoController.AgregarProducto = async (req, res) => {
    const { codigo_producto, nombre_producto, descripcion, proveedor, precio, cantidadUnidad, marca, categoria, } = req.body;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    const codeProductExist = await prodRepo.findOne({
        where: { codigo_Producto: codigo_producto },
    });
    if (codeProductExist) {
        return res.status(400).json({
            ok: false,
            message: "Ya existe un producto con el codigo " + codigo_producto,
        });
    }
    const producto = new Producto_1.Producto();
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
    const errors = await class_validator_1.validate(producto, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ ok: false, message: "Algo salio mal!" });
    }
    //try to save a product
    try {
        const nuevoProducto = await prodRepo.save(producto);
        //declaraciones de IVA
        let PorcentajeTotal = 1.0;
        let PorcentajeIVA = 0.13;
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
        }
        catch (error) {
            console.log("Error al aplicar IVA!!!");
        }
    }
    catch (e) {
        res.status(409).json({
            ok: false,
            message: "Algo esta fallando!",
            e,
        });
    }
};
//edit a product
ProductoController.EditarProducto = async (req, res) => {
    let producto;
    const { id } = req.params;
    const { nombre_producto, descripcion, descuento, costo_standar, proveedor, marca, categoria, } = req.body;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        producto = await prodRepo.findOneOrFail(id);
        producto.nombreProducto = nombre_producto;
        producto.descripcion = descripcion;
        producto.descuento = descuento;
        producto.costo_standar = costo_standar;
        producto.proveedor = proveedor;
        producto.marca = marca;
        producto.categoria = categoria;
    }
    catch (error) {
        return res
            .status(404)
            .json({ ok: false, message: "No se encontro resultado " });
    }
    const ValidateOps = {
        validationError: { target: false, value: false },
    };
    const errors = await class_validator_1.validate(producto, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ ok: false, message: "Algo salio mal!" });
    }
    //try to save producto
    try {
        await prodRepo.save(producto);
        //all ok
        res.json({ ok: true, message: "Producto actualizado con exito!" });
    }
    catch (error) {
        return res.status(409).json({ ok: true, message: "Algo ha salido mal!" });
    }
};
//delete product
ProductoController.EliminarProducto = async (req, res) => {
    const { id } = req.params;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
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
            const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${producto.image}`);
            if (fs.existsSync(imgdir)) {
                fs.unlinkSync(imgdir);
            }
        }
        catch (error) {
            return res.send({
                ok: false,
                message: "No puedes eliminar este producto porque podria haber registros vinculados",
            });
        }
        //delete
        res.json({ ok: true, message: "Se elimino el producto!" });
    }
    catch (e) {
        return res.status(404).json({
            ok: false,
            message: "No hay registros con este id: " + id,
        });
    }
};
//subir imagen producto
ProductoController.ImagenProducto = async (req, res) => {
    const { id } = req.params;
    const productRepo = typeorm_1.getRepository(Producto_1.Producto);
    let product;
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
            let pathImg;
            let result;
            try {
                product = await productRepo.findOneOrFail(id);
                const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${product.image}`);
                pathImg = path.resolve(__dirname, `../../src/uploads/productos/${nombreFoto}`);
                //console.log(pathImg);
                result = await cloudinary.v2.uploader.upload(pathImg, {
                    folder: "productos",
                });
                if (!product.public_id) {
                    console.log("Producto nuevo");
                }
                else {
                    const deleteFotoCloud = await cloudinary.v2.uploader.destroy(product.public_id);
                    console.log(deleteFotoCloud);
                }
            }
            catch (e) {
                res.status(404).json({
                    ok: false,
                    message: "No hay registros con este id: " + id,
                });
            }
            //try to save product
            try {
                await productRepo
                    .createQueryBuilder()
                    .update(Producto_1.Producto)
                    .set({
                    image: result.secure_url,
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
        res.json({ ok: true, message: "La imagen se ha guardado." });
    }
};
//eliminar imagen Producto
ProductoController.EliminarImagenProducto = async (req, res) => {
    const { id } = req.params;
    const productRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        const product = await productRepo.findOneOrFail(id);
        //const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${product.image}`);
        if (!product.public_id) {
            console.log("No Image");
        }
        else {
            const deleteFotoCloud = await cloudinary.v2.uploader.destroy(product.public_id);
            console.log(deleteFotoCloud);
        }
    }
    catch (e) {
        return res.status(404).json({
            ok: false,
            message: "No hay registros con este id: " + id,
        });
    }
    //try to save product
    try {
        await productRepo
            .createQueryBuilder()
            .update(Producto_1.Producto)
            .set({ image: "producto.png", public_id: "" })
            .where({ id })
            .execute();
        res.json({ ok: true, message: "imagen de producto eliminada" });
    }
    catch (error) {
        return res
            .status(409)
            .json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//getProductoById
ProductoController.getProductoById = async (id) => {
    const ordenRepo = typeorm_1.getRepository(Producto_1.Producto);
    const producto = await ordenRepo.findOneOrFail(id);
    return producto;
};
//estado producto
ProductoController.EstadoProducto = async (req, res) => {
    let producto;
    const id = req.body;
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        producto = await proRepo.findOneOrFail(id);
        producto.status = !producto.status;
        await proRepo.save(producto);
        res.json({ ok: true, mesaage: "Estado de producto ha cambiado!" });
    }
    catch (error) {
        res.json({
            ok: false,
            message: "No se pudo completar la accion solicitada",
        });
    }
};
//get image producto
ProductoController.getImage = (req, res) => {
    const name = req.query.image;
    const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${name}`);
    if (fs.existsSync(imgdir)) {
        res.sendFile(imgdir);
        return;
    }
};
//productos mas vendidos
ProductoController.ProductosMasVendidos = async (req, res) => {
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const detalleORepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
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
        let totalPages;
        let nextPage;
        let prevPage;
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
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: "Algo ha fallado!" });
    }
};
//productos mas ratings
ProductoController.ProductosConMasRatings = async (req, res) => {
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const ratingRepo = typeorm_1.getRepository(Rating_1.Rating);
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
            let totalRating = Rating.map((a) => a.ratingNumber).reduce((a, b) => a + b, 0);
            const total = totalRating / Rating.length;
            const newPro = { ...pro, total };
            return newPro;
        });
        let totalPages;
        let nextPage;
        let prevPage;
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
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: "Algo ha fallado!" });
    }
};
//agregarProductoStock
ProductoController.AgregarProductoStock = async (req, res) => {
    const { id } = res.locals.jwtPayload;
    const { idp } = req.params;
    const { cantidadProducto, precioCompra, beneficio } = req.body;
    let producto;
    let empleado;
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const empleadoRepo = typeorm_1.getRepository(Employee_1.Employee);
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
        let modificadoPor = empleado.nombre +
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
            }
            else {
                //declaracion porcentaje de ganancia mediante el mercado
                let PorcentajeBeneficio = beneficio / 100;
                //declaraciones de IVA
                let PorcentajeTotal = 1.0;
                let PorcentajeIVA = 0.13;
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
                }
                else {
                    res.status(400).json({
                        ok: false,
                        message: "Aun hay producto en stock",
                    });
                }
            }
        }
        catch (error) {
            console.log(error);
        }
    }
    catch (error) {
        return res
            .status(400)
            .json({ ok: false, message: "Administrador no encontrado" });
    }
};
exports.default = ProductoController;
//# sourceMappingURL=Producto.js.map