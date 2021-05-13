"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Cliente_1 = require("../controller/Cliente");
const jwt_1 = require("../middleware/jwt");
const router = express_1.Router();
const cliente = Cliente_1.default;
router.get('/', cliente.getClientes);
router.post('/', cliente.RegistroCliente);
router.post('/photo', jwt_1.CheckJwt, cliente.ImagenPerfilCliente);
router.get('/:id', cliente.getClienteByID);
router.put('/', jwt_1.CheckJwt, cliente.EditarCliente);
router.delete('/:id', cliente.EliminarCliente);
exports.default = router;
//# sourceMappingURL=cliente.js.map