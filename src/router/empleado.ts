import { Router } from 'express';
import { EmpleadoController } from "../controller/Employee";
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';



const router = Router();
const empleado = EmpleadoController;

router.get('/', [CheckJwt, checkRole(['admin'])], empleado.getEmpleados)
router.post('/', empleado.AgregarEmpleadoA);
router.post('/register', [CheckJwt, checkRole(['admin'])],empleado.AgregarEmpleadoE);
router.get('/:id', empleado.getEmpleadoByID);
router.delete('/:id', empleado.EliminarEmpleado);
router.put('/:id',CheckJwt, empleado.EditarEmpleado);
router.post('/photo', CheckJwt, empleado.ImagenPerfilEmpleado);
//empleados paginados
router.post('/empleado-paginated', empleado.MostrarEmpleadosPaginados);


export default router