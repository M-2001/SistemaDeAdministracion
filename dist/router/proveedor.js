"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const Proveedor_1 = require("../controller/Proveedor");
const router = express_1.Router();
const proveedor = Proveedor_1.default;
router.get('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.MostrarProveedors);
router.post('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.AgregarProveedor);
router.get('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.ObtenerProveedorPorID);
router.put('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.ActualizarProveedor);
router.delete('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.EliminarProveedor);
router.post('/proveedores-paginated', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.MostrarProveedoresPaginados);
//estado del producto
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], proveedor.EstadoProveedor);
exports.default = router;
//# sourceMappingURL=proveedor.js.map