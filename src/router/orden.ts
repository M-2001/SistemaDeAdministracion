import { Router } from "express";
import { CheckJwt } from '../middleware/jwt';
import OrdenController from '../controller/Orden';
import { checkRoleU } from '../middleware/roleUser';
import CarritoController from '../controller/Carrito';

const router = Router();

const ordenC = CarritoController;
const order = OrdenController;

router.post('/new-order', [CheckJwt, checkRoleU(['user'])], ordenC.guardarOrden_DetalleOrden);
router.get('/order-paginated',[CheckJwt], order.MostrarOrdenPaginadas)
router.get('/order-client',CheckJwt,order.MostrarOrdenCliente)
router.post('/add-reservation',[CheckJwt, checkRoleU(['user'])], order.AddReservacion)
router.post('/order-status/:id', order.EstadoOrden)

export default router;