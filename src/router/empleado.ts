import { Router } from 'express';
import { EmpleadoController } from "../controller/Employee";
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';



const router = Router();
const empleado = EmpleadoController;

router.get('/', [CheckJwt, checkRole(['admin'])], empleado.getEmpleados)
router.post('/', empleado.AgregarEmpleadoA);
router.post('/register', [CheckJwt, checkRole(['admin'])],empleado.AgregarEmpleadoE);
router.get('/image',empleado.getImage)
router.get('/check/:code',empleado.checkIfExistUser)

router.post('/photo', CheckJwt, empleado.ImagenPerfilEmpleado);
//empleados paginados
router.get('/empleado-paginated', [CheckJwt, checkRole(['admin'])], empleado.MostrarEmpleadosPaginados);
router.get('/:id',CheckJwt, empleado.getEmpleadoByID);
router.delete('/:id', [CheckJwt, checkRole(['admin'])], empleado.EliminarEmpleado);
router.put('/:id',CheckJwt, empleado.EditarEmpleado);


export default router