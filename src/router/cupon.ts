import { Router } from 'express';
import CuponController from '../controller/Cupon';
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';
const router = Router();

const cupon = CuponController;

router.post('/create-cupon', CheckJwt, cupon.CrearCupon);
router.put('/status', CheckJwt, cupon.EstadoCupon);
router.get('/show-cupons', CheckJwt, cupon.MostrarCupones);
router.get('/cupon-paginated', cupon.MostrarCuponesPaginados);
router.delete('/destroy-cupon', [CheckJwt, checkRole(['admin'])], cupon.EliminarCupon)

export default router;