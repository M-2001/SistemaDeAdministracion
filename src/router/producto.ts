
import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import ProductoController from '../controller/Producto';

const router = Router();
const producto = ProductoController;

router.get('/', producto.MostrarProductos);
router.get('/image',producto.getImage)
router.get('/products-paginate', producto.ProductosPaginados);
router.post('/product-categoria', producto.MostrarProductosCategoria);
router.post('/product-marca', producto.MostrarProductosMarca);
router.post('/file-product/:id', producto.ImagenProducto);
//eliminar image de producto
router.put('/file-product/:id', producto.EliminarImagenProducto);
//estado del producto
router.put('/status', /*[CheckJwt, checkRole(['admin'])],*/ producto.EstadoProducto);
router.post('/', /*[CheckJwt, checkRole(['admin'])],*/ producto.AgregarProducto);
router.get('/:id', producto.ObtenerProductoPorID);
router.put('/:id', producto.EditarProducto);
router.delete('/:id', /*[CheckJwt, checkRole(['admin'])],*/ producto.EliminarProducto);

export default router;