"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Producto_1 = require("../entity/Producto");
const path = require("path");
const fs = require("fs");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
const Rating_1 = require("../entity/Rating");
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
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [productos, _] = await productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .leftJoin('producto.categoria', 'cat')
            .take(3)
            .addSelect(['cat.categoria'])
            .getManyAndCount();
        if (productos.length > 0) {
            return res.json({ productos });
        }
        else {
            return res.json({ message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        return res.json({ message: 'No se encontraron resultados' });
    }
};
//mostrar productos paginados
ProductoController.ProductosPaginados = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let search = req.query.producto || "";
    let order;
    let typeOrder = Number(req.query.order || 0);
    if (typeOrder === 0) {
        order = 'ASC';
    }
    else if (typeOrder === 1) {
        order = 'DESC';
    }
    else {
        order = 'ASC';
    }
    pagina = Number(pagina);
    let take = 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [producto, totalItems] = await productoRepo.createQueryBuilder('producto')
            .innerJoin('producto.marca', 'marca')
            .innerJoin('producto.categoria', 'categoria')
            .innerJoin('producto.proveedor', 'proveedor')
            .addSelect(['proveedor.nombre_proveedor', 'proveedor.id'])
            .addSelect(['categoria.categoria', 'categoria.id'])
            .addSelect(['marca.marca', 'marca.id'])
            .skip((pagina - 1) * take)
            .take(take)
            .where("producto.nombreProducto like :name", { name: `%${search}%` })
            .orderBy('producto.id', order)
            .getManyAndCount();
        for (let i = 0; i < producto.length; i++) {
            const prod = producto[i];
            if (prod.catidad_por_unidad <= 1) {
                prod.status = false;
                prod.catidad_por_unidad = 1;
                productoRepo.save(producto);
                console.log(prod.status);
            }
        }
        if (producto.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, producto, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false });
        }
        else {
            res.json({ message: 'No se encontraron resultados', empty: true });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
};
//mostrar productos por categorias
ProductoController.MostrarProductosCategoria = async (req, res) => {
    const categoria = req.query.categoria;
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [producto, totalItems] = await productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .leftJoin('producto.categoria', 'cat')
            .addSelect(['cat.categoria'])
            .skip((pagina - 1) * take)
            .take(take)
            .where({ categoria })
            .getManyAndCount();
        if (producto.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, producto, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false });
        }
        else {
            res.json({ message: 'No se encontraron resultados con categoria: ' + categoria, empty: true });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
};
//mostrar por marca
ProductoController.MostrarProductosMarca = async (req, res) => {
    const marca = req.query.marca;
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [producto, totalItems] = await productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.categoria', 'cat')
            .addSelect(['cat.categoria'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .skip((pagina - 1) * take)
            .take(take)
            .where({ marca })
            .getManyAndCount();
        if (producto.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, producto, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false });
        }
        else {
            res.json({ message: 'No se encontraron resultados', empty: true });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
};
//obtener producto por id
ProductoController.ObtenerProductoPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const producto = await productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .leftJoin('producto.categoria', 'cat')
            .addSelect(['cat.categoria']).where({ id })
            .getOneOrFail();
        if (!producto) {
            res.status(500).json({ msj: "Error al procesar la peticion" });
            return;
        }
        res.json({ producto });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
};
//create new product
ProductoController.AgregarProducto = async (req, res) => {
    const { codigo_producto, nombre_producto, descripcion, costo_standar, cantidad_unidad, descuento, proveedor, marca, categoria } = req.body;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    const codeProductExist = await prodRepo.findOne({
        where: { codigo_Producto: codigo_producto }
    });
    if (codeProductExist) {
        return res.status(400).json({ msj: 'Ya existe un producto con el codigo ' + codigo_producto, ok: false, error: 'code' });
    }
    const producto = new Producto_1.Producto();
    producto.codigo_Producto = codigo_producto;
    producto.nombreProducto = nombre_producto;
    producto.descripcion = descripcion;
    producto.costo_standar = costo_standar;
    producto.catidad_por_unidad = cantidad_unidad;
    producto.descuento = descuento;
    producto.proveedor = proveedor;
    producto.marca = marca;
    producto.categoria = categoria;
    //validations
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(producto, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    //try to save a product
    try {
        await prodRepo.save(producto);
    }
    catch (e) {
        res.status(409).json({ message: 'something goes wrong' });
    }
    //all ok
    res.json({ mjs: 'Producto creado con exito', producto, ok: true });
};
//edit a product
ProductoController.EditarProducto = async (req, res) => {
    let producto;
    const { id } = req.params;
    const { nombre_producto, descripcion, costo_standar, cantidad_unidad, descuento, proveedor, marca, categoria } = req.body;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        producto = await prodRepo.findOneOrFail(id);
        producto.nombreProducto = nombre_producto;
        producto.descripcion = descripcion;
        producto.costo_standar = costo_standar;
        producto.catidad_por_unidad = cantidad_unidad;
        producto.descuento = descuento;
        producto.proveedor = proveedor;
        producto.marca = marca;
        producto.categoria = categoria;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(producto, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    //try to save producto
    try {
        await prodRepo.save(producto);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!', });
    }
    res.json({ messge: 'Producto actualizado con exito!', ok: true, producto });
};
//delete product
ProductoController.EliminarProducto = async (req, res) => {
    const { id } = req.params;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        const producto = await prodRepo.findOneOrFail(id);
        try {
            await prodRepo.remove(producto);
            const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${producto.image}`);
            if (fs.existsSync(imgdir)) {
                fs.unlinkSync(imgdir);
            }
        }
        catch (error) {
            return res.send({ message: 'No puedes eliminar este producto porque podria haber registros vinculados' });
        }
        //delete 
        res.json({ messge: 'Se elimino el producto!', ok: true });
    }
    catch (e) {
        res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
};
//subir imagen producto
ProductoController.ImagenProducto = async (req, res) => {
    const { id } = req.params;
    const productRepo = typeorm_1.getRepository(Producto_1.Producto);
    let producto;
    if (req.files === undefined || req.files.foto === undefined) {
        res.status(400).json({ ok: false, message: 'Ningun archivo selecionando' });
    }
    else {
        let foto = req.files.foto;
        let fotoName = foto.name.split('.');
        console.log(fotoName);
        let ext = fotoName[fotoName.length - 1];
        //extensiones permitidas 
        const extFile = ['png', 'jpeg', 'jpg', 'git'];
        if (extFile.indexOf(ext) < 0) {
            return res.status(400)
                .json({ message: 'Las estensiones permitidas son ' + extFile.join(', ') });
        }
        else {
            //cambiar nombre del archivo
            var nombreFoto = `${id}-${new Date().getMilliseconds()}.${ext}`;
            foto.mv(`src/uploads/productos/${nombreFoto}`, (err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err });
                }
            });
            try {
                const product = await productRepo.findOneOrFail(id);
                const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${product.image}`);
                if (fs.existsSync(imgdir)) {
                    fs.unlinkSync(imgdir);
                }
                console.log(product);
            }
            catch (e) {
                res.status(404).json({ message: 'No hay registros con este id: ' + id });
            }
            //try to save product
            try {
                await productRepo.createQueryBuilder().update(Producto_1.Producto).set({ image: nombreFoto }).where({ id }).execute();
            }
            catch (error) {
                res.status(409).json({ message: 'Algo ha salido mal!' });
            }
        }
        res.json({ message: 'La imagen se ha guardado.' });
    }
};
//eliminar imagen Producto
ProductoController.EliminarImagenProducto = async (req, res) => {
    const { id } = req.params;
    const productRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        const product = await productRepo.findOneOrFail(id);
        const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${product.image}`);
        if (fs.existsSync(imgdir)) {
            fs.unlinkSync(imgdir);
        }
        console.log(product);
    }
    catch (e) {
        res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
    //try to save product
    try {
        await productRepo.createQueryBuilder().update(Producto_1.Producto).set({ image: "producto.png" }).where({ id }).execute();
    }
    catch (error) {
        res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ message: 'imagen de producto eliminada' });
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
        res.json({ ok: true });
    }
    catch (error) {
        res.json({ ok: false, message: 'No se pudo completar la accion solicitada' });
    }
};
//productos mas vendidos
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
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const [productos, totalItems] = await productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.categoria', 'cat')
            .addSelect(['cat.categoria'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        const formated = productos.map(async (pro) => {
            let producto = pro.id;
            const DO = await detalleORepo.createQueryBuilder('detalle_orden')
                .innerJoin('detalle_orden.producto', 'dto')
                .addSelect(['dto.nombreProducto', 'dto.id'])
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
        Promise.all(formated).then(values => {
            res.json({ ok: true, values, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false });
        });
    }
    catch (error) {
        console.log(error);
    }
};
//productos mas vendidos
ProductoController.ProductosConMasRatings = async (req, res) => {
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const ratingRepo = typeorm_1.getRepository(Rating_1.Rating);
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const [productos, totalItems] = await productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.categoria', 'cat')
            .addSelect(['cat.categoria'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        const formated = productos.map(async (pro) => {
            let producto = pro.id;
            const Rating = await ratingRepo.createQueryBuilder('rating')
                .innerJoin('rating.producto', 'dto')
                .addSelect(['dto.nombreProducto', 'dto.id'])
                .where({ producto })
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
        Promise.all(formated).then(values => {
            res.json({ ok: true, values, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false });
        });
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = ProductoController;
//# sourceMappingURL=Producto.js.map