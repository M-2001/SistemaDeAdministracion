"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Marca_1 = require("../entity/Marca");
class MarcaController {
}
MarcaController.MostrarMarcas = async (_, res) => {
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marca = await marcaRepo.find();
        if (marca.length > 0) {
            res.json(marca);
        }
        else {
            res.json({ message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
};
MarcaController.MostrarMarcasPaginadas = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let mark = req.query.marca || '';
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const marcasRepo = typeorm_1.getRepository(Marca_1.Marca);
        const [marcas, totalItems] = await marcasRepo.createQueryBuilder('marca').skip((pagina - 1) * take)
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
            res.json({ ok: true, marcas, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
};
MarcaController.AgregarMarca = async (req, res) => {
    const { marca } = req.body;
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marcaExist = await marcaRepo.findOne({ where: { marca: marca } });
        console.log(marcaExist);
        if (marcaExist) {
            return res.status(400).json({ message: 'Ya existe una marca con ese nombre' });
        }
        const marc = new Marca_1.Marca();
        marc.marca = marca;
        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await class_validator_1.validate(marc, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        await marcaRepo.save(marc);
    }
    catch (error) {
        res.status(400).json({ message: 'Algo ha salio mal!' });
    }
    //all ok 
    res.json({ message: 'Se ha agregado una nueva marca' });
};
MarcaController.ObtenerMarcaPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marca = await marcaRepo.findOneOrFail({ where: { id } });
        res.json({ marca });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
};
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
        return res.status(404).json({ message: 'No se han encontrado resultados con el id: ' + id });
    }
    //Try to save data Category
    try {
        await marcaRepo.save(marc);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Se actualizo el registro!' });
};
MarcaController.EliminarMarca = async (req, res) => {
    let marca;
    const { id } = req.params;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marca = await marcaRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        await marcaRepo.remove(marca);
    }
    catch (error) {
        return res.send({ message: 'No puedes eliminar esta marca porque podria haber registros vinculados' });
    }
    res.json({ messge: 'Marca ha sido eliminada!', ok: true });
};
MarcaController.EstadoMarca = async (req, res) => {
    let marca;
    const id = req.body;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marca = await marcaRepo.findOneOrFail(id);
        if (marca.status == true) {
            marca.status = false;
        }
        else {
            marca.status = true;
        }
        const marcaStatus = await marcaRepo.save(marca);
        res.json({ ok: true, marca: marcaStatus.status });
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = MarcaController;
//# sourceMappingURL=Marca.js.map