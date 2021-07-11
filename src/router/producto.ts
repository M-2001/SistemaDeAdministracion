
import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import ProductoController from '../controller/Producto';

const router = Router();
const producto = ProductoController;

router.get('/news', producto.MostrarProductos);
router.get('/image', producto.getImage)
router.get('/bestSellers', producto.ProductosMasVendidos)
router.get('/products-paginate', producto.ProductosPaginados);
router.get('/product-categoria', producto.MostrarProductosCategoria);
router.get('/product-marca', producto.MostrarProductosMarca);
router.post('/file-product/:id', CheckJwt, producto.ImagenProducto);
//agregar producto a stock
router.post('/add-stock/:idp', [CheckJwt, checkRole(['admin'])], producto.AgregarProductoStock);
//eliminar image de producto
router.put('/file-product/:id', producto.EliminarImagenProducto);
//estado del producto
router.put('/status', [CheckJwt,checkRole(['admin'])], producto.EstadoProducto);

router.get('/bestSellers', producto.ProductosMasVendidos);

//produstos con mas rating
router.get('/more-ratings', producto.ProductosConMasRatings)
router.post('/', CheckJwt, producto.AgregarProducto);
router.get('/:id', producto.ObtenerProductoPorID);
router.put('/:id', [CheckJwt, checkRole(['admin'])], producto.EditarProducto);
router.delete('/:id', [CheckJwt, checkRole(['admin'])], producto.EliminarProducto);

export default router;