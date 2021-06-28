"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Categoria_1 = require("../entity/Categoria");
class CategoriaController {
}
CategoriaController.MostrarCategorias = async (_, res) => {
    try {
        const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const categoria = await categoriaRepo.find();
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
};
CategoriaController.MostrarCategoriasPaginadas = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let category = req.query.categoria || "";
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const categoriasRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const [categorias, totalItems] = await categoriasRepo.createQueryBuilder('categoria')
            .skip((pagina - 1) * take)
            .take(take)
            .where("categoria.categoria like :name", { name: `%${category}%` })
            .getManyAndCount();
        if (categorias.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
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
};
CategoriaController.AgregarCategoria = async (req, res) => {
    const { categoria } = req.body;
    try {
        const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const categoryExist = await categoriaRepo.findOne({ where: { categoria: categoria } });
        console.log(categoryExist);
        if (categoryExist) {
            return res.status(400).json({ message: 'Ya existe una categoria con ese nombre' });
        }
        const category = new Categoria_1.Categoria();
        category.categoria = categoria;
        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await class_validator_1.validate(category, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        await categoriaRepo.save(category);
    }
    catch (error) {
        res.status(400).json({ message: 'Algo ha salio mal!' });
    }
    //all ok 
    res.json({ message: 'Se ha agregado una nueva categoria' });
};
CategoriaController.ObtenerCategoriaPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
        const categoria = await categoriaRepo.findOneOrFail({ where: { id } });
        res.json({ categoria });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
};
CategoriaController.ActualizarCategoria = async (req, res) => {
    let category;
    const { id } = req.params;
    const { categoria } = req.body;
    const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
    try {
        category = await categoriaRepo.findOneOrFail({ where: { id } });
        category.categoria = categoria;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(category, ValidateOps);
    //Try to save data Category
    try {
        await categoriaRepo.save(category);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Se actualizo el registro!' });
};
CategoriaController.EliminarCategoria = async (req, res) => {
    let category;
    const { id } = req.params;
    const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
    try {
        category = await categoriaRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        await categoriaRepo.remove(category);
    }
    catch (error) {
        return res.send({ message: 'No puedes eliminar esta categoria porque podria haber registros vinculados' });
    }
    res.json({ messge: 'Categoria ha sido eliminada!', ok: true });
};
//estado categoria
CategoriaController.EstadoCategoria = async (req, res) => {
    let categoria;
    const id = req.body;
    const categoriaRepo = typeorm_1.getRepository(Categoria_1.Categoria);
    try {
        categoria = await categoriaRepo.findOneOrFail(id);
        if (categoria.status == true) {
            categoria.status = false;
        }
        else {
            categoria.status = true;
        }
        const categoriaStatus = await categoriaRepo.save(categoria);
        res.json({ ok: true, categoria: categoriaStatus.status });
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = CategoriaController;
//# sourceMappingURL=Categoria.js.map