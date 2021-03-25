import { Router } from "express";
// import { CheckJwt } from '../middleware/jwt';
import CarritoController from "../controller/Carrito";

const router = Router();
const carrito = CarritoController;

router.post('/new', carrito.AgregarProductoCarrito);

export default router