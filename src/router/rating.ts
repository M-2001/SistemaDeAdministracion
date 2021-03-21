import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import RatingController from '../controller/Rating';

const router = Router();
const rating = RatingController;

router.post('/', [CheckJwt], rating.AgregarRating);
router.get('/', rating.MostrarRating);
router.get('/:id', rating.RatingPorId);
router.put('/:id',[CheckJwt], rating.ActualizarRating);
router.delete('/:id',[CheckJwt], rating.EliminarRating);
//rating paginados
router.post('/rating-paginated', rating.MostrarRatingPaginados);

//rating por producto
router.post('/product', rating.MostrarRatingPorProducto);

export default router;