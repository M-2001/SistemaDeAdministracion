"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
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
        this.getAllProducts = () => __awaiter(this, void 0, void 0, function* () {
            try {
                const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
                const producto = yield productoRepo.find();
                if (producto.length > 0) {
                    return producto;
                }
            }
            catch (error) {
                return [];
            }
        });
    }
}
ProductoController.MostrarProductos = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => __awaiter(void 0, void 0, void 0, function* () {
        let pagina = req.query.pagina || 0;
        pagina = Number(pagina);
        let take = req.query.limit || 10;
        take = Number(take);
        try {
            const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
            const producto = yield productoRepo.createQueryBuilder('producto')
                .leftJoin('producto.proveedor', 'prov')
                .addSelect(['prov.nombre_proveedor'])
                .leftJoin('producto.marca', 'marca')
                .addSelect(['marca.marca'])
                .leftJoin('producto.categoria', 'cat')
                .addSelect(['cat.categoria'])
                .skip(pagina)
                .take(take)
                .getManyAndCount()
                .then(productos => {
                return res.json({ productos });
            })
                .catch(err => {
                return res.json({ message: 'Algo salio mal' });
            });
            // if (producto.length > 0) {
            //     return res.json({productos : producto})
            // } else {
            //     return res.json({message : 'No se encontraron resultados'})
            // }
        }
        catch (error) {
            return res.json({ message: 'No se encontraron resultados' });
        }
    }));
});
//mostrar productos paginados
ProductoController.ProductosPaginados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [producto, totalItems] = yield productoRepo.createQueryBuilder('producto')
            .innerJoin('producto.marca', 'marca')
            .innerJoin('producto.categoria', 'categoria')
            .innerJoin('producto.proveedor', 'proveedor')
            .addSelect(['proveedor.nombre_proveedor'])
            .addSelect(['categoria.categoria'])
            .addSelect(['marca.marca'])
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        //.orderBy('codigo_producto', 'DESC')
        if (producto.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, producto, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
});
//mostrar productos por categorias
ProductoController.MostrarProductosCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoria } = req.body;
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [producto, totalItems] = yield productoRepo.createQueryBuilder('producto')
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
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, producto, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados con categoria: ' + categoria });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
});
//mostrar por marca
ProductoController.MostrarProductosMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marca } = req.body;
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const [producto, totalItems] = yield productoRepo.createQueryBuilder('producto')
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
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, producto, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
});
//obtener producto por id
ProductoController.ObtenerProductoPorID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
        const producto = yield productoRepo.createQueryBuilder('producto')
            .leftJoin('producto.proveedor', 'prov')
            .addSelect(['prov.nombre_proveedor'])
            .leftJoin('producto.marca', 'marca')
            .addSelect(['marca.marca'])
            .leftJoin('producto.categoria', 'cat')
            .addSelect(['cat.categoria']).where({ id })
            .getOneOrFail();
        const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${producto.image}`);
        if (fs.existsSync(imgdir)) {
            res.sendFile(imgdir);
        }
        else {
            const notImage = path.resolve(__dirname, `../../src/server/assets/${producto.image}`);
            res.sendFile(notImage);
        }
        console.log(producto);
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
//create new product
ProductoController.AgregarProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { codigo_producto, nombre_producto, descripcion, costo_standar, cantidad_unidad, descuento, proveedor, marca, categoria } = req.body;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    const codeProductExist = yield prodRepo.findOne({
        where: { codigo_Producto: codigo_producto }
    });
    if (codeProductExist) {
        return res.status(400).json({ msj: 'Ya existe un producto con el codigo ' + codigo_producto });
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
    const errors = yield class_validator_1.validate(producto, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    //try to save a product
    try {
        yield prodRepo.save(producto);
    }
    catch (e) {
        res.status(409).json({ message: 'something goes wrong' });
    }
    //all ok
    res.json({ mjs: 'Producto creado con exito', producto });
});
//edit a product
ProductoController.EditarProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let producto;
    const { id } = req.params;
    const { nombre_producto, descripcion, costo_standar, cantidad_unidad, descuento, proveedor, marca, categoria } = req.body;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        producto = yield prodRepo.findOneOrFail(id);
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
    const errors = yield class_validator_1.validate(producto, ValidateOps);
    //try to save producto
    try {
        yield prodRepo.save(producto);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Producto actualizado con exito!' });
    console.log(id);
});
//delete product
ProductoController.EliminarProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const prodRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        const producto = yield prodRepo.findOneOrFail(id);
        yield prodRepo.delete(producto);
        const imgdir = path.resolve(__dirname, `../../src/uploads/productos/${producto.image}`);
        if (fs.existsSync(imgdir)) {
            fs.unlinkSync(imgdir);
        }
        //delete 
        res.status(201).json({ message: 'Producto eliminado' });
    }
    catch (e) {
        res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
//subir imagen producto
ProductoController.ImagenProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
                const product = yield productRepo.findOneOrFail(id);
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
                yield productRepo.createQueryBuilder().update(Producto_1.Producto).set({ image: nombreFoto }).where({ id }).execute();
            }
            catch (error) {
                res.status(409).json({ message: 'Algo ha salido mal!' });
            }
        }
        res.json({ message: 'La imagen se ha guardado.' });
    }
});
//eliminar imagen Producto
ProductoController.EliminarImagenProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const productRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        const product = yield productRepo.findOneOrFail(id);
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
        yield productRepo.createQueryBuilder().update(Producto_1.Producto).set({ image: "producto.png" }).where({ id }).execute();
    }
    catch (error) {
        res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ message: 'imagen de producto eliminada' });
});
//getProductoById
ProductoController.getProductoById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const ordenRepo = typeorm_1.getRepository(Producto_1.Producto);
    const producto = yield ordenRepo.findOneOrFail(id);
    return producto;
});
//estado producto
ProductoController.EstadoProducto = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let producto;
    const id = req.body;
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        producto = yield proRepo.findOneOrFail(id);
        if (producto.status == true) {
            producto.status = false;
        }
        else {
            producto.status = true;
        }
        const productoStatus = yield proRepo.save(producto);
        res.json({ ok: true, cupon: productoStatus.status });
    }
    catch (error) {
        console.log(error);
    }
});
//productos mas vendidos
ProductoController.ProductosMasVendido = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const detalleORepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    try {
        const query = yield detalleORepo.createQueryBuilder('detalle_orden')
            //.addSelect('detalle_orden.producto')
            //.addSelect('SUM(detalle_orden.cantidad)', 'totalVentas')
            .innerJoin('detalle_orden.producto', 'proDO')
            .select('detalle_orden.id')
            .addSelect('proDO.nombreProducto')
            //.addSelect(['proDO.nombreProducto', 'proDO.id'])
            //.addSelect('SUM(detalle_orden.cantidad)', 'totalVentas')
            .groupBy('detalle_orden.producto')
            .orderBy('SUM(detalle_orden.cantidad)', 'DESC')
            .getMany();
        // const bestSeller = await detalleORepo.createQueryBuilder('detalle_orden')
        // .select(['detalle_orden.producto', 'proDO.nombreProducto'])
        // .addSelect('SUM(detalle_orden.cantidad)', 'totalVentas')
        // .innerJoin('detalle_orden.producto', 'proDO', 'detalle_orden.producto = proDO.id')
        // .groupBy('detalle_orden.producto')
        // .orderBy('SUM(detalle_orden.cantidad)', 'DESC')
        // .getMany()
        const productosMasVendidos = yield detalleORepo.query(` select 
            // dto.productoId,p.nombreProducto, sum(dto.cantidad) as totalVentas
            
            // from detalle_orden dto
            // inner join producto p on dto.productoId = p.id
            // group by dto.productoId
            // order by sum(dto.cantidad) desc
            // limit 0, 5`);
        res.json({ productosMasVendidos });
    }
    catch (error) {
        console.log(error);
    }
});
//productos mas vendidos
ProductoController.ProductosMasVendidos = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const detalleORepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    try {
        const productos = yield productoRepo.find();
        productos.map((pro) => __awaiter(void 0, void 0, void 0, function* () {
            let producto = pro.id;
            const DO = yield detalleORepo.createQueryBuilder('detalle_orden')
                .innerJoin('detalle_orden.producto', 'dto')
                .addSelect(['dto.nombreProducto', 'dto.id'])
                .where({ producto })
                //.orderBy('SUM(detalle_orden.cantidad)', 'DESC')
                .getMany();
            let totalVenta = DO.map((a) => a.cantidad).reduce((a, b) => a + b);
            console.log(pro, `Total ventas: `, totalVenta);
            //console.log(DO.map((a)=>a.cantidad).reduce((a,b)=> a+b));
        }));
        res.json({ productos });
    }
    catch (error) {
        console.log(error);
    }
});
//productos mas vendidos
ProductoController.ProductosConMasRatings = (_req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    const ratingRepo = typeorm_1.getRepository(Rating_1.Rating);
    try {
        const productos = yield productoRepo.find();
        productos.map((pro) => __awaiter(void 0, void 0, void 0, function* () {
            let producto = pro.id;
            const Rating = yield ratingRepo.createQueryBuilder('rating')
                .innerJoin('rating.producto', 'dto')
                .addSelect(['dto.nombreProducto', 'dto.id'])
                .where({ producto })
                .getMany();
            console.log(pro, `ratings: `, Rating.length);
        }));
        res.json({ productos });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = ProductoController;
//# sourceMappingURL=Producto.js.map