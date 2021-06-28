"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../middleware/jwt");
const Rating_1 = require("../controller/Rating");
const roleUser_1 = require("../middleware/roleUser");
const router = express_1.Router();
const rating = Rating_1.default;
router.post('/', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], rating.AgregarRating);
router.post('/rating-paginated', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], rating.MostrarRatingPaginados);
//rating por producto
router.get('/product', rating.MostrarRatingPorProducto);
router.get('/', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], rating.MostrarRating);
router.get('/:id', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], rating.RatingPorId);
router.put('/:id', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], rating.ActualizarRating);
router.delete('/:id', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], rating.EliminarRating);
//rating paginados
exports.default = router;
//# sourceMappingURL=rating.js.map