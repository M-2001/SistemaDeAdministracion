import { Router } from "express";
import CategoriaController from '../controller/Categoria';
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';

const router = Router();
const categoria = CategoriaController;

router.get('/', categoria.MostrarCategorias);
router.put('/status',[CheckJwt,checkRole(['admin'])],  categoria.EstadoCategoria);
router.get('/categorias-paginated',categoria.MostrarCategoriasPaginadas)
router.post('/',[CheckJwt,checkRole(['admin'])], categoria.AgregarCategoria);
router.get('/:id',CheckJwt,  categoria.ObtenerCategoriaPorID);
router.put('/:id',CheckJwt,categoria.ActualizarCategoria);
router.delete('/:id',[CheckJwt,checkRole(['admin'])],  categoria.EliminarCategoria);
//estado del producto


export default router;