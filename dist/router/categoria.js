"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Categoria_1 = require("../controller/Categoria");
const role_1 = require("../middleware/role");
const jwt_1 = require("../middleware/jwt");
const router = express_1.Router();
const categoria = Categoria_1.default;
router.get("/", categoria.MostrarCategorias);
router.put("/status", [jwt_1.CheckJwt, role_1.checkRole(["admin"])], categoria.EstadoCategoria);
router.get("/categorias-paginated", categoria.MostrarCategoriasPaginadas);
router.post("/", [jwt_1.CheckJwt, role_1.checkRole(["admin"])], categoria.AgregarCategoria);
router.get("/:id", jwt_1.CheckJwt, categoria.ObtenerCategoriaPorID);
router.put("/:id", jwt_1.CheckJwt, categoria.ActualizarCategoria);
router.delete("/:id", [jwt_1.CheckJwt, role_1.checkRole(["admin"])], categoria.EliminarCategoria);
//estado del producto
exports.default = router;
//# sourceMappingURL=categoria.js.map