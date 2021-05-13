"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const Marca_1 = require("../controller/Marca");
const router = express_1.Router();
const marca = Marca_1.default;
router.get('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.MostrarMarcas);
router.post('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.AgregarMarca);
router.get('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.ObtenerMarcaPorID);
router.put('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.ActualizarMarca);
router.delete('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.EliminarMarca);
router.post('/marcas-paginated', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.MostrarMarcasPaginadas);
//estado del producto
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], marca.EstadoMarca);
exports.default = router;
//# sourceMappingURL=marca.js.map