"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Cliente_1 = require("../controller/Cliente");
const jwt_1 = require("../middleware/jwt");
const role_1 = require("../middleware/role");
const router = express_1.Router();
const cliente = Cliente_1.default;
router.get('/', cliente.getClientes);
router.get('/best-client', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], cliente.MejoresClientes);
router.post('/', cliente.RegistroCliente);
router.get('/image', cliente.getImage);
router.post('/photo/:id', jwt_1.CheckJwt, cliente.ImagenPerfilCliente);
router.put('/:id', jwt_1.CheckJwt, cliente.EditarCliente);
router.delete('/:id', cliente.EliminarCliente);
router.get('/:id', jwt_1.CheckJwt, cliente.getClienteByID);
exports.default = router;
//# sourceMappingURL=cliente.js.map