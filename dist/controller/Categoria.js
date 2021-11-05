"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Categoria_1 = require("../entity/Categoria");
const Producto_1 = require("../entity/Producto");
class CategoriaController {
}
_a = CategoriaController;
//mostrar categorias
CategoriaController.MostrarCategorias = async (_, res) => {
    try {
        const categoriaRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
        const categoria = await categoriaRepo.find({ where: { status: true } });
        if (categoria.length > 0) {
            res.json({ ok: true, categoria });
        }
        else {
            res.json({ ok: false, message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ ok: false, message: 'Algo ha salido mal' });
    }
};
//Mostrar categorias paginadas
CategoriaController.MostrarCategoriasPaginadas = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let category = req.query.categoria || "";
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const categoriasRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
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
            res.json({ ok: false, message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ ok: false, message: 'Algo ha salido mal!' });
    }
};
//agregar una nueva categoria
CategoriaController.AgregarCategoria = async (req, res) => {
    const { categoria } = req.body;
    try {
        const categoriaRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
        const categoryExist = await categoriaRepo.findOne({ where: { categoria: categoria } });
        console.log(categoryExist);
        if (categoryExist) {
            return res.status(400).json({ ok: false, message: 'Ya existe una categoria con ese nombre' });
        }
        const category = new Categoria_1.Categoria();
        category.categoria = categoria;
        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await (0, class_validator_1.validate)(category, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ ok: false, errors });
        }
        await categoriaRepo.save(category);
        //all ok
        res.json({ ok: true, message: 'Se ha agregado una nueva categoria' });
    }
    catch (error) {
        res.status(400).json({ ok: false, message: 'Algo ha salio mal!' });
    }
};
//obtener categoria por ID
CategoriaController.ObtenerCategoriaPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const categoriaRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
        const categoria = await categoriaRepo.findOneOrFail({ where: { id } });
        res.json({ ok: true, categoria });
    }
    catch (error) {
        return res.status(404).json({ ok: false, message: 'No hay registros con este id: ' + id });
    }
};
//actualizar categoria
CategoriaController.ActualizarCategoria = async (req, res) => {
    let category;
    const { id } = req.params;
    const { categoria } = req.body;
    const categoriaRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
    try {
        category = await categoriaRepo.findOneOrFail({ where: { id } });
        category.categoria = categoria;
    }
    catch (error) {
        return res.status(404).json({ ok: false, message: 'No se han encontrado resultados ' });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = await (0, class_validator_1.validate)(category, ValidateOps);
    //Try to save data Category
    try {
        await categoriaRepo.save(category);
        res.json({ ok: true, message: 'Se actualizo el registro!' });
    }
    catch (error) {
        return res.status(409).json({ ok: false, message: 'Algo ha salido mal!' });
    }
};
//eliminar categoria
CategoriaController.EliminarCategoria = async (req, res) => {
    let category;
    const { id } = req.params;
    const categoriaRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
    try {
        category = await categoriaRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ ok: false, message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        await categoriaRepo.remove(category);
        res.json({ ok: true, messge: 'Categoria ha sido eliminada!' });
    }
    catch (error) {
        return res.send({ ok: false, message: 'No puedes eliminar esta categoria porque podria haber registros vinculados' });
    }
};
//estado categoria
CategoriaController.EstadoCategoria = async (req, res) => {
    let categoria;
    const id = req.body;
    const categoriaRepo = (0, typeorm_1.getRepository)(Categoria_1.Categoria);
    const productoRepo = (0, typeorm_1.getRepository)(Producto_1.Producto);
    try {
        categoria = await categoriaRepo.findOneOrFail(id);
    }
    catch (error) {
        return res.json({ ok: false, message: `Categoria con el id: ${req.body.id} no encontrada!!!` });
    }
    try {
        const [producto, totalResult] = await productoRepo.findAndCount({ where: { categoria: categoria } });
        if (totalResult > 0) {
            return res.status(300).json({ ok: false, message: `Advertencia: No se puede modificar el estado con el id: ${categoria.id} porque tiene registros asociados!` });
        }
        else {
            if (categoria.status == true) {
                categoria.status = false;
            }
            else {
                categoria.status = true;
            }
            const categoriaStatus = await categoriaRepo.save(categoria);
            res.json({ ok: true, message: 'Estado de categoria actualizado!' });
        }
    }
    catch (error) {
        return res.json({ ok: false, message: "Sucedio un error Inesperado!!!" });
    }
};
exports.default = CategoriaController;
//# sourceMappingURL=Categoria.js.map