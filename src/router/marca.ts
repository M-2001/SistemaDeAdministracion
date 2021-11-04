import { Router } from "express";
import { checkRole } from "../middleware/role";
import { CheckJwt } from "../middleware/jwt";
import MarcaController from "../controller/Marca";

const router = Router();
const marca = MarcaController;

router.get("/", marca.MostrarMarcas);
router.get("/marcas-paginated", marca.MostrarMarcasPaginadas);
router.post("/", [CheckJwt, checkRole(["admin"])], marca.AgregarMarca);
router.put("/status", [CheckJwt, checkRole(["admin"])], marca.EstadoMarca);
router.get("/:id", marca.ObtenerMarcaPorID);
router.put("/:id", CheckJwt, marca.ActualizarMarca);
router.delete("/:id", [CheckJwt, checkRole(["admin"])], marca.EliminarMarca);

export default router;
