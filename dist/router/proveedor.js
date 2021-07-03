"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const Proveedor_1 = require("../controller/Proveedor");
const router = express_1.Router();
const proveedor = Proveedor_1.default;
router.get('/proveedores-paginated', proveedor.MostrarProveedoresPaginados);
//estado del producto
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.EstadoProveedor);
router.get('/', proveedor.MostrarProveedors);
router.post('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.AgregarProveedor);
router.get('/:id', proveedor.ObtenerProveedorPorID);
router.put('/:id', jwt_1.CheckJwt, proveedor.ActualizarProveedor);
router.delete('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.EliminarProveedor);
exports.default = router;
//# sourceMappingURL=proveedor.js.map