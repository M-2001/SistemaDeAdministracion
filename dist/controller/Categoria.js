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
const Categoria_1 = require("../entity/Categoria");
class CategoriaController {
}
CategoriaController.MostrarCategorias = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const categoria = yield categoriaRepo.find();
        if (categoria.length > 0) {
            res.json(categoria);
        }
        else {
            res.json({ message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
});
CategoriaController.MostrarCategoriasPaginadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const categoriasRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const [categorias, totalItems] = yield categoriasRepo.findAndCount({ take, skip: (pagina - 1) * take });
        if (categorias.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, categorias, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
CategoriaController.AgregarCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { categoria } = req.body;
    try {
        const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const categoryExist = yield categoriaRepo.findOne({ where: { categoria: categoria } });
        console.log(categoryExist);
        if (categoryExist) {
            return res.status(400).json({ message: 'Ya existe una categoria con ese nombre' });
        }
        const category = new Categoria_1.Categoria();
        category.categoria = categoria;
        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = yield class_validator_1.validate(category, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        yield categoriaRepo.save(category);
    }
    catch (error) {
        res.status(400).json({ message: 'Algo ha salio mal!' });
    }
    //all ok 
    res.json({ message: 'Se ha agregado una nueva categoria' });
});
CategoriaController.ObtenerCategoriaPorID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const categoria = yield categoriaRepo.findOneOrFail({ where: { id } });
        res.json({ categoria });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
CategoriaController.ActualizarCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let category;
    const { id } = req.params;
    const { categoria } = req.body;
    const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
    try {
        category = yield categoriaRepo.findOneOrFail({ where: { id } });
        category.categoria = categoria;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(category, ValidateOps);
    //Try to save data Category
    try {
        yield categoriaRepo.save(category);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Se actualizo el registro!' });
    console.log(id);
});
CategoriaController.EliminarCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let category;
    const { id } = req.params;
    const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
    try {
        category = yield categoriaRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        yield categoriaRepo.remove(category);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Categoria ha sido eliminada!' });
});
//estado categoria
CategoriaController.EstadoCategoria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let categoria;
    const id = req.body;
    const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
    try {
        categoria = yield categoriaRepo.findOneOrFail(id);
        if (categoria.status == true) {
            categoria.status = false;
        }
        else {
            categoria.status = true;
        }
        const categoriaStatus = yield categoriaRepo.save(categoria);
        res.json({ ok: true, categoria: categoriaStatus.status });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = CategoriaController;
//# sourceMappingURL=Categoria.js.map