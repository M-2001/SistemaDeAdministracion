"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Employee_1 = require("../controller/Employee");
const jwt_1 = require("../middleware/jwt");
const role_1 = require("../middleware/role");
const router = express_1.Router();
const empleado = Employee_1.EmpleadoController;
router.get('/', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], empleado.getEmpleados);
router.post('/', empleado.AgregarEmpleadoA);
router.post('/register', [jwt_1.CheckJwt, role_1.checkRole(['admin'])], empleado.AgregarEmpleadoE);
router.get('/:id', empleado.getEmpleadoByID);
router.delete('/:id', empleado.EliminarEmpleado);
router.put('/:id', jwt_1.CheckJwt, empleado.EditarEmpleado);
router.post('/photo', jwt_1.CheckJwt, empleado.ImagenPerfilEmpleado);
//empleados paginados
router.post('/empleado-paginated', empleado.MostrarEmpleadosPaginados);
exports.default = router;
//# sourceMappingURL=empleado.js.map