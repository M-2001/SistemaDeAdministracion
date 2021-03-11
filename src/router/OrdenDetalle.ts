import { Router } from "express";
import { CheckJwt } from '../middleware/jwt';
//import { checkRoleU } from '../middleware/roleUser';
import OrdenDetalle from '../controller/OrdenDetalle';

const router = Router();
const ordenDte = OrdenDetalle;

//router.get('/', categoria.MostrarCategorias);
//router.post('/', ordenDte.IntentoPago);
// router.get('/:id', categoria.ObtenerCategoriaPorID);
// router.put('/:id', categoria.ActualizarCategoria);
// router.delete('/:id', categoria.EliminarCategoria);

export default router;