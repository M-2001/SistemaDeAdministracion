import { Router } from "express";
import { CheckJwt } from '../middleware/jwt';
import OrdenController from '../controller/Orden';
import { checkRoleU } from '../middleware/roleUser';

const router = Router();
const orden = OrdenController;

//router.get('/', categoria.MostrarCategorias);
router.post('/', [CheckJwt, checkRoleU(['user'])], orden.AgregarOrden);
router.post('/order', orden.AgregarProductoCarrito);
// router.put('/:id', categoria.ActualizarCategoria);
// router.delete('/:id', categoria.EliminarCategoria);

export default router;