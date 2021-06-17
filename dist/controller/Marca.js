"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Marca_1 = require("../entity/Marca");
class MarcaController {
}
MarcaController.MostrarMarcas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marca = yield marcaRepo.find();
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
});
MarcaController.MostrarMarcasPaginadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const marcasRepo = typeorm_1.getRepository(Marca_1.Marca);
        const [marcas, totalItems] = yield marcasRepo.findAndCount({ take, skip: (pagina - 1) * take });
        if (marcas.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
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
});
MarcaController.AgregarMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { marca } = req.body;
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marcaExist = yield marcaRepo.findOne({ where: { marca: marca } });
        console.log(marcaExist);
        if (marcaExist) {
            return res.status(400).json({ message: 'Ya existe una marca con ese nombre' });
        }
        const marc = new Marca_1.Marca();
        marc.marca = marca;
        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = yield class_validator_1.validate(marc, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        yield marcaRepo.save(marc);
    }
    catch (error) {
        res.status(400).json({ message: 'Algo ha salio mal!' });
    }
    //all ok 
    res.json({ message: 'Se ha agregado una nueva marca' });
});
MarcaController.ObtenerMarcaPorID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
        const marca = yield marcaRepo.findOneOrFail({ where: { id } });
        res.json({ marca });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
MarcaController.ActualizarMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let marc;
    const { id } = req.params;
    const { marca } = req.body;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marc = yield marcaRepo.findOneOrFail({ where: { id } });
        marc.marca = marca;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados con el id: ' + id });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(marc, ValidateOps);
    //Try to save data Category
    try {
        yield marcaRepo.save(marc);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Se actualizo el registro!' });
});
MarcaController.EliminarMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let marca;
    const { id } = req.params;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marca = yield marcaRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        yield marcaRepo.remove(marca);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Marca ha sido eliminada!' });
});
//estado marca
MarcaController.EstadoMarca = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let marca;
    const id = req.body;
    const marcaRepo = typeorm_1.getRepository(Marca_1.Marca);
    try {
        marca = yield marcaRepo.findOneOrFail(id);
        if (marca.status == true) {
            marca.status = false;
        }
        else {
            marca.status = true;
        }
        const marcaStatus = yield marcaRepo.save(marca);
        res.json({ ok: true, marca: marcaStatus.status });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = MarcaController;
//# sourceMappingURL=Marca.js.map