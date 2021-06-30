"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const OrdenDetalle_1 = require("../controller/OrdenDetalle");
const router = express_1.Router();
const ordenDte = OrdenDetalle_1.default;
router.post('/or-detalles', ordenDte.MostrarDteOrdenPaginadas);
router.get('/details', ordenDte.MostrarDteOrderByOrderId);
exports.default = router;
//# sourceMappingURL=OrdenDetalle.js.map