import { Router } from 'express';
import CarritoController from '../controller/Carrito';

const router = Router();

const carrito = CarritoController;

router.post('/add', carrito.AgregarProductoCarrito)

export default router;