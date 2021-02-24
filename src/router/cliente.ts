import { Router } from "express";
import ClienteController from '../controller/Cliente';
import { CheckJwt } from '../middleware/jwt';

const router = Router();
const cliente = ClienteController;

router.get('/', cliente.getClientes)
router.post('/', cliente.RegistroCliente);
router.post('/photo', CheckJwt, cliente.ImagenPerfilCliente);
router.get('/:id', cliente.getClienteByID);
router.put('/', CheckJwt, cliente.EditarCliente);
router.delete('/:id', cliente.EliminarCliente);

export default router