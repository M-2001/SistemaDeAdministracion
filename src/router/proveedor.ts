import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import ProveedorController from "../controller/Proveedor";

const router = Router();
const proveedor = ProveedorController;

router.get('/', proveedor.MostrarProveedors);
router.post('/', proveedor.AgregarProveedor);
router.get('/:id', proveedor.ObtenerProveedorPorID);
router.put('/:id', proveedor.ActualizarProveedor);
router.delete('/:id', proveedor.EliminarProveedor);
router.post('/proveedores-paginated', proveedor.MostrarProveedoresPaginados)
//estado del producto
router.put('/status', proveedor.EstadoProveedor);

export default router;