import { Router } from "express";
import UserController from '../controller/Usuario';


const router = Router();
const user = UserController;

router.get('/', user.getUsers)

export default router