import { Router } from 'express';
import CuponController from '../controller/Cupon';
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';
const router = Router();

const cupon = CuponController;
router.post('/create-cupon',[CheckJwt, checkRole(['admin'])], cupon.CrearCupon);
router.get("/get-cupon",cupon.MostrarCupon)
router.put('/status',[CheckJwt, checkRole(['admin'])], cupon.EstadoCupon);
router.get('/show-cupons',[CheckJwt, checkRole(['admin'])], cupon.MostrarCupones);
router.post('/cupon-paginated',[CheckJwt, checkRole(['admin'])], cupon.MostrarCuponesPaginados);
router.post('/share-cupon', cupon.SendCupon);
router.delete('/destroy-cupon',[CheckJwt, checkRole(['admin'])], cupon.EliminarCupon)
export default router;