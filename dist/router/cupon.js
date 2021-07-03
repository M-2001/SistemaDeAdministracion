"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Cupon_1 = require("../controller/Cupon");
const jwt_1 = require("../middleware/jwt");
const role_1 = require("../middleware/role");
const router = express_1.Router();
//rutas necesarias para los cupones
const cupon = Cupon_1.default;
router.post('/create-cupon', jwt_1.CheckJwt, cupon.CrearCupon);
router.get("/get-cupon", jwt_1.CheckJwt, cupon.MostrarCupon);
router.put('/status', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], cupon.EstadoCupon);
router.get('/show-cupons', jwt_1.CheckJwt, cupon.MostrarCupones);
router.get('/cupon-paginated', jwt_1.CheckJwt, cupon.MostrarCuponesPaginados);
router.post('/share-cupon', jwt_1.CheckJwt, cupon.SendCupon);
router.delete('/destroy-cupon', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], cupon.EliminarCupon);
exports.default = router;
//# sourceMappingURL=cupon.js.map