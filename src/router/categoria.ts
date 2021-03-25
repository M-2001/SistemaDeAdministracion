import { Router } from "express";
import CategoriaController from '../controller/Categoria';
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';

const router = Router();
const categoria = CategoriaController;

router.get('/', categoria.MostrarCategorias);
router.get('/all',categoria.MostrarCategoriasPaginadas)
router.post('/',categoria.AgregarCategoria);
router.get('/:id', categoria.ObtenerCategoriaPorID);
router.put('/:id', categoria.ActualizarCategoria);
router.delete('/:id', categoria.EliminarCategoria);

export default router;