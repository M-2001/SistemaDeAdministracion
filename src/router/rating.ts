import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import RatingController from '../controller/Rating';
import { checkRoleU } from '../middleware/roleUser';

const router = Router();
const rating = RatingController;

router.post('/', [CheckJwt, checkRoleU(['user'])], rating.AgregarRating);
router.post('/rating-paginated', [CheckJwt, checkRoleU(['user'])], rating.MostrarRatingPaginados);
//rating por producto
router.get('/product', rating.MostrarRatingPorProducto);
router.get('/', [CheckJwt, checkRoleU(['user'])], rating.MostrarRating);
router.get('/:id', [CheckJwt, checkRoleU(['user'])], rating.RatingPorId);
router.put('/:id', [CheckJwt, checkRoleU(['user'])], rating.ActualizarRating);
router.delete('/:id', [CheckJwt, checkRoleU(['user'])], rating.EliminarRating);
//rating paginados


export default router;