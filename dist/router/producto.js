"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const Producto_1 = require("../controller/Producto");
const router = express_1.Router();
const producto = Producto_1.default;
router.get('/news', producto.MostrarProductos);
router.get('/image', producto.getImage);
router.get('/bestSellers', producto.ProductosMasVendidos);
router.get('/products-paginate', producto.ProductosPaginados);
router.get('/product-categoria', producto.MostrarProductosCategoria);
router.get('/product-marca', producto.MostrarProductosMarca);
router.post('/file-product/:id', jwt_1.CheckJwt, producto.ImagenProducto);
//agregar producto a stock
router.post('/add-stock/:idp', jwt_1.CheckJwt, producto.AgregarProductoStock);
//eliminar image de producto
router.put('/file-product/:id', producto.EliminarImagenProducto);
//estado del producto
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], producto.EstadoProducto);
router.get('/bestSellers', producto.ProductosMasVendidos);
//produstos con mas rating
router.get('/more-ratings', producto.ProductosConMasRatings);
router.post('/', jwt_1.CheckJwt, producto.AgregarProducto);
router.get('/:id', producto.ObtenerProductoPorID);
router.put('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], producto.EditarProducto);
router.delete('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], producto.EliminarProducto);
exports.default = router;
//# sourceMappingURL=producto.js.map