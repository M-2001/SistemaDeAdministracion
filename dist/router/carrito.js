"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Carrito_1 = require("../controller/Carrito");
const router = (0, express_1.Router)();
const carrito = Carrito_1.default;
router.post('/add', carrito.AgregarProductoCarrito);
exports.default = router;
//# sourceMappingURL=carrito.js.map