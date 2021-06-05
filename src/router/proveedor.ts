import { Router } from "express";
import { checkRole } from '../middleware/role';
import { CheckJwt } from '../middleware/jwt';
import ProveedorController from "../controller/Proveedor";

const router = Router();
const proveedor = ProveedorController;


router.get('/proveedores-paginated', proveedor.MostrarProveedoresPaginados)
//estado del producto
router.put('/status', CheckJwt, proveedor.EstadoProveedor);
router.get('/', proveedor.MostrarProveedors);
router.post('/', CheckJwt, proveedor.AgregarProveedor);
router.get('/:id', proveedor.ObtenerProveedorPorID);
router.put('/:id', CheckJwt, proveedor.ActualizarProveedor);
router.delete('/:id', [CheckJwt, checkRole(['admin'])], proveedor.EliminarProveedor);

export default router;