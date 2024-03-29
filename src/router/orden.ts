import { Router } from "express";
import { CheckJwt } from '../middleware/jwt';
import OrdenController from '../controller/Orden';
import { checkRoleU } from '../middleware/roleUser';
import CarritoController from '../controller/Carrito';
import { checkRole } from '../middleware/role';

const router = Router();

const ordenC = CarritoController;
const order = OrdenController;

router.get("/orders",CheckJwt,order.MostrarOrdenes)
router.post('/new-order', [CheckJwt, checkRoleU(['user'])], ordenC.guardarOrden_DetalleOrden);
router.get('/order-paginated',[CheckJwt], order.MostrarOrdenPaginadas)
router.get('/order-client',CheckJwt,order.MostrarOrdenCliente)
router.post('/add-reservation',[CheckJwt, checkRoleU(['user'])], order.AddReservacion)
//Ruta para Cancelar una orden por parte de los clientes
router.post('/cancel-order', [CheckJwt, checkRoleU(['user'])], order.CancelReservation);

router.post('/local-order',CheckJwt, order.AddOrdenClienteLocal)
router.post('/order-status/:id',CheckJwt, order.EstadoOrden);
export default router;