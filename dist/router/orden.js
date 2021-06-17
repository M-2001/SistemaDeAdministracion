"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const jwt_1 = require("../middleware/jwt");
const Orden_1 = require("../controller/Orden");
const roleUser_1 = require("../middleware/roleUser");
const Carrito_1 = require("../controller/Carrito");
const router = express_1.Router();
const ordenC = Carrito_1.default;
const order = Orden_1.default;
router.post('/new-order', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], ordenC.guardarOrden_DetalleOrden);
router.post('/order-paginated', order.MostrarOrdenPaginadas);
router.post('/add-reservation', [jwt_1.CheckJwt, roleUser_1.checkRoleU(['user'])], order.AddReservacion);
router.post('/order-status/:id', order.EstadoOrden);
exports.default = router;
//# sourceMappingURL=orden.js.map