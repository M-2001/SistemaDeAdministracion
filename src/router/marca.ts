import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import MarcaController from '../controller/Marca';

const router = Router();
const marca = MarcaController;

router.get('/', marca.MostrarMarcas);
router.get('/all', marca.MostrarMarcasPaginadas);
router.post('/', marca.AgregarMarca);
router.get('/:id', marca.ObtenerMarcaPorID);
router.put('/:id', marca.ActualizarMarca);
router.delete('/:id', marca.EliminarMarca);

export default router;