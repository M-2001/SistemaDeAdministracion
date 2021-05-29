"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Categoria_1 = require("../controller/Categoria");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const router = express_1.Router();
const categoria = Categoria_1.default;
router.get('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.MostrarCategorias);
router.post('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.AgregarCategoria);
router.get('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.ObtenerCategoriaPorID);
router.put('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.ActualizarCategoria);
router.delete('/:id', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.EliminarCategoria);
router.post('/categorias-paginated', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.MostrarCategoriasPaginadas);
//estado del producto
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], categoria.EstadoCategoria);
exports.default = router;
//# sourceMappingURL=categoria.js.map