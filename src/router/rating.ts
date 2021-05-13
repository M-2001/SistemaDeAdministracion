import { Router } from "express";
import { CheckJwt } from '../middleware/jwt';
import RatingController from '../controller/Rating';
import { checkRoleU } from '../middleware/roleUser';

const router = Router();
const rating = RatingController;

router.post('/', [CheckJwt, checkRoleU(['user'])], rating.AgregarRating);
router.get('/', [CheckJwt, checkRoleU(['user'])], rating.MostrarRating);
router.get('/:id',[CheckJwt, checkRoleU(['user'])], rating.RatingPorId);
router.put('/:id',[CheckJwt, checkRoleU(['user'])], rating.ActualizarRating);
router.delete('/:id',[CheckJwt, checkRoleU(['user'])], rating.EliminarRating);
//rating paginados
router.post('/rating-paginated',[CheckJwt, checkRoleU(['user'])], rating.MostrarRatingPaginados);

//rating por producto
router.post('/product', [CheckJwt, checkRoleU(['user'])], rating.MostrarRatingPorProducto);

export default router;