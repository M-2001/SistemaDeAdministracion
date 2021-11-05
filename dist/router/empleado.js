"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Employee_1 = require("../controller/Employee");
const jwt_1 = require("../middleware/jwt");
const role_1 = require("../middleware/role");
const router = (0, express_1.Router)();
const empleado = Employee_1.EmpleadoController;
//Rutas para controlador empleados
router.get('/', empleado.getEmpleados);
router.post('/', empleado.AgregarEmpleadoA);
router.post('/register', [jwt_1.CheckJwt, (0, role_1.checkRole)(['admin'])], empleado.AgregarEmpleadoE);
router.get('/image', empleado.getImage);
router.get('/check/:code', empleado.checkIfExistUser);
router.post('/photo', jwt_1.CheckJwt, empleado.ImagenPerfilEmpleado);
//empleados paginados
router.get('/empleado-paginated', [jwt_1.CheckJwt, (0, role_1.checkRole)(['admin'])], empleado.MostrarEmpleadosPaginados);
router.get('/:id', jwt_1.CheckJwt, empleado.getEmpleadoByID);
router.delete('/:id', [jwt_1.CheckJwt, (0, role_1.checkRole)(['admin'])], empleado.EliminarEmpleado);
router.put('/:id', jwt_1.CheckJwt, empleado.EditarEmpleado);
exports.default = router;
//# sourceMappingURL=empleado.js.map