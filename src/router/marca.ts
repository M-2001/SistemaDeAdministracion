import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import MarcaController from '../controller/Marca';

const router = Router();
const marca = MarcaController;

router.get('/', /*[CheckJwt, checkRole(['admin'])],*/ marca.MostrarMarcas);
router.get('/marcas-paginated', marca.MostrarMarcasPaginadas)
router.post('/', /*[CheckJwt, checkRole(['admin'])],*/ marca.AgregarMarca);
router.put('/status', /*[CheckJwt, checkRole(['admin'])],*/ marca.EstadoMarca);
router.get('/:id', /*[CheckJwt, checkRole(['admin'])],*/ marca.ObtenerMarcaPorID);
router.put('/:id', /*[CheckJwt, checkRole(['admin'])],*/ marca.ActualizarMarca);
router.delete('/:id', /*[CheckJwt, checkRole(['admin'])],*/ marca.EliminarMarca);
//estado del producto

export default router;