import { Router } from "express";
import ClienteController from '../controller/Cliente';
import { CheckJwt } from '../middleware/jwt';
import { checkRole } from '../middleware/role';

const router = Router();
const cliente = ClienteController;

router.get('/', cliente.getClientes)
router.get('/best-client',[CheckJwt, checkRole(['admin'])], cliente.MejoresClientes)
router.post('/', cliente.RegistroCliente);
router.get('/image', cliente.getImage)
router.post('/photo/:id', CheckJwt, cliente.ImagenPerfilCliente);
router.put('/:id', CheckJwt, cliente.EditarCliente);
router.delete('/:id', cliente.EliminarCliente);
router.get('/:id',CheckJwt, cliente.getClienteByID);

export default router