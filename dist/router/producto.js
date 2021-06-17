"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const Producto_1 = require("../controller/Producto");
const router = express_1.Router();
const producto = Producto_1.default;
router.get('/', producto.MostrarProductos);
router.get('/products-paginate', producto.ProductosPaginados);
router.post('/product-categoria', producto.MostrarProductosCategoria);
router.post('/product-marca', producto.MostrarProductosMarca);
router.post('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], producto.AgregarProducto);
router.get('/:id', producto.ObtenerProductoPorID);
router.put('/:id', producto.EditarProducto);
router.delete('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], producto.EliminarProducto);
router.post('/file-product/:id', producto.ImagenProducto);
//eliminar image de producto
router.put('/file-product/:id', producto.EliminarImagenProducto);
//estado del producto
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], producto.EstadoProducto);
//productos mas vendidos
router.post('/bestSellers', producto.ProductosMasVendidos);
//produstos con mas rating
router.post('/more-ratings', producto.ProductosConMasRatings);
exports.default = router;
//# sourceMappingURL=producto.js.map