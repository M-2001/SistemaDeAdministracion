import { Router, Request, Response } from 'express';
import { EmpleadoController } from "../controller/Employee";
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';
import bodyParser = require('body-parser');
import fileUpload from "../middleware/image";
import { UploadedFile } from 'express-fileupload';


const router = Router();
const empleado = EmpleadoController;

router.get('/', [CheckJwt, checkRole(['admin'])], empleado.getEmpleados)
router.post('/', empleado.AgregarEmpleado);
router.get('/:id', empleado.getEmpleadoByID);
router.delete('/:id', empleado.EliminarEmpleado);
router.put('/:id',CheckJwt, empleado.EditarEmpleado);
router.post('/photo', CheckJwt, empleado.ImagenPerfilEmpleado);

export default router