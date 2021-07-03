import { Router } from 'express';
import CuponController from '../controller/Cupon';
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';
const router = Router();

//rutas necesarias para los cupones

const cupon = CuponController;
router.post('/create-cupon',CheckJwt, cupon.CrearCupon);
router.get("/get-cupon", CheckJwt, cupon.MostrarCupon)
router.put('/status',[CheckJwt, checkRole(['admin'])] , cupon.EstadoCupon);
router.get('/show-cupons',CheckJwt,  cupon.MostrarCupones);
router.get('/cupon-paginated',CheckJwt, cupon.MostrarCuponesPaginados);
router.post('/share-cupon', CheckJwt, cupon.SendCupon);
router.delete('/destroy-cupon',[CheckJwt, checkRole(['admin'])], cupon.EliminarCupon)
export default router;