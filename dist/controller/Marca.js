"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Marca_1 = require("../entity/Marca");
const Producto_1 = require("../entity/Producto");
class MarcaController {
}
//mostrar marcas
MarcaController.MostrarMarcas = async (_, res) => {
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marca = await marcaRepo.find({ where: { status: true } });
        if (marca.length > 0) {
            res.json({ ok: true, marca });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados",
            });
        }
    }
    catch (error) {
        res.json({ ok: false, message: "Algo ha salido mal" });
    }
};
//mostrar marcas paginadas
MarcaController.MostrarMarcasPaginadas = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let mark = req.query.marca || "";
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const marcasRepo = typeorm_1.getRepository(Marca_1.Marca);
        const [marcas, totalItems] = await marcasRepo
            .createQueryBuilder("marca")
            .skip((pagina - 1) * take)
            .take(take)
            .where("marca.marca like :name", { name: `%${mark}%` })
            .getManyAndCount();
        if (marcas.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                marcas,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados!",
            });
        }
    }
    catch (error) {
        res.json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//agregar una nueva marca
MarcaController.AgregarMarca = async (req, res) => {
    const { marca } = req.body;
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marcaExist = await marcaRepo.findOne({
            where: { marca: marca },
        });
        //console.log(marcaExist);
        if (marcaExist) {
            return res
                .status(400)
                .json({
                ok: false,
                message: "Ya existe una marca con ese nombre",
            });
        }
        const marc = new Marca_1.Marca();
        marc.marca = marca;
        //validations
        const ValidateOps = {
            validationError: { target: false, value: false },
        };
        const errors = await class_validator_1.validate(marc, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ ok: false, errors });
        }
        await marcaRepo.save(marc);
        //all ok
        res.json({ ok: true, message: "Se ha agregado una nueva marca" });
    }
    catch (error) {
        res.status(400).json({ ok: false, message: "Algo ha salio mal!" });
    }
};
//mostrar marca por ID
MarcaController.ObtenerMarcaPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marca = await marcaRepo.findOneOrFail({ where: { id } });
        res.json({ ok: true, marca });
    }
    catch (error) {
        return res
            .status(404)
            .json({
            ok: false,
            message: "No hay registros con este id: " + id,
        });
    }
};
//actualizar marca
MarcaController.ActualizarMarca = async (req, res) => {
    let marc;
    const { id } = req.params;
    const { marca } = req.body;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marc = await marcaRepo.findOneOrFail({ where: { id } });
        marc.marca = marca;
    }
    catch (error) {
        return res
            .status(404)
            .json({
            ok: false,
            message: "No se han encontrado resultados con el id: " + id,
        });
    }
    //Try to save data Category
    try {
        await marcaRepo.save(marc);
        res.json({ ok: true, messge: "Se actualizo el registro!" });
    }
    catch (error) {
        return res
            .status(409)
            .json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//eliminar una marca
MarcaController.EliminarMarca = async (req, res) => {
    let marca;
    const { id } = req.params;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marca = await marcaRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res
            .status(404)
            .json({
            ok: false,
            message: "No se han encontrado resultados ",
        });
    }
    //Try to delete marca
    try {
        await marcaRepo.remove(marca);
        res.json({ ok: true, messge: "Marca ha sido eliminada!" });
    }
    catch (error) {
        return res.send({
            ok: false,
            message: "No puedes eliminar esta marca porque podria haber registros vinculados",
        });
    }
};
//Cambiar estado de una marca
MarcaController.EstadoMarca = async (req, res) => {
    let marca;
    const id = req.body;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    const productoRepo = typeorm_1.getRepository(Producto_1.Producto);
    try {
        marca = await marcaRepo.findOneOrFail(id);
    }
    catch (error) {
        return res.json({ ok: false, message: `Marca con el id: ${req.body.id} no encontrada!!!` });
    }
    try {
        const [producto, totalResult] = await productoRepo.findAndCount({ where: { marca: marca } });
        if (totalResult > 0) {
            return res.status(300).json({ ok: false, message: `Advertencia: No se puede modificar el estado con el id: ${marca.id} porque tiene registros asociados!` });
        }
        else {
            if (marca.status == true) {
                marca.status = false;
            }
            else {
                marca.status = true;
            }
            const marcaStatus = await marcaRepo.save(marca);
            return res.json({ ok: true, message: "Estado de marca actualizado!" });
        }
    }
    catch (error) {
        return res.json({ ok: false, message: "Sucedio un error Inesperado!!!" });
    }
};
exports.default = MarcaController;
//# sourceMappingURL=Marca.js.map