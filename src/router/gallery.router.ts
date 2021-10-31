import { Router } from "express";
import { checkRole } from "../middleware/role";
import { CheckJwt } from "../middleware/jwt";
import { GaleriaController } from "../controller/Galeria.Controller";

const router = Router();
const gallery = GaleriaController;

router.post("/add/:productID", CheckJwt, gallery.AgregarGaleria);
router.put(
	"/remove-image-gallery/:galleryID",
	CheckJwt,
	gallery.RemoverImagenGaleria
);
router.put(
	"/update-image-gallery/:galleryID",
	CheckJwt,
	gallery.ActualizarImagenGaleria
);
router.get("/mostrar-gallery-product/:productID", gallery.MostrarGaleria);

export default router;
