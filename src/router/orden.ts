import { Router } from "express";
import { CheckJwt } from '../middleware/jwt';
import OrdenController from '../controller/Orden';
import { checkRoleU } from '../middleware/roleUser';
import CarritoController from '../controller/Carrito';

const router = Router();

const ordenC = CarritoController;
const order = OrdenController;

router.post('/new-order', [CheckJwt, checkRoleU(['user'])], ordenC.guardarOrden_DetalleOrden);
router.post('/order-paginated', order.MostrarOrdenPaginadas)

export default router;