import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import ProveedorController from "../controller/Proveedor";

const router = Router();
const proveedor = ProveedorController;

router.get('/',[CheckJwt, checkRole(['admin'])], proveedor.MostrarProveedors);
router.post('/', [CheckJwt, checkRole(['admin'])], proveedor.AgregarProveedor);
router.get('/:id', [CheckJwt, checkRole(['admin'])], proveedor.ObtenerProveedorPorID);
router.put('/:id', [CheckJwt, checkRole(['admin'])], proveedor.ActualizarProveedor);
router.delete('/:id', [CheckJwt, checkRole(['admin'])], proveedor.EliminarProveedor);
router.post('/proveedores-paginated', [CheckJwt, checkRole(['admin'])], proveedor.MostrarProveedoresPaginados)
//estado del producto
router.put('/status', [CheckJwt, checkRole(['admin'])], proveedor.EstadoProveedor);

export default router;