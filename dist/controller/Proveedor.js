"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const Proveedor_1 = require("../entity/Proveedor");
const typeorm_1 = require("typeorm");
class ProveedorController {
}
//Mostrar proveedores
ProveedorController.MostrarProveedors = async (_, res) => {
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedor = await proveedorRepo.find();
        if (proveedor.length > 0) {
            res.json({ ok: true, proveedor });
        }
        else {
            res.json({ ok: false, message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ ok: false, message: 'Algo ha salido mal' });
    }
};
//Mostrar proveedores paginados
ProveedorController.MostrarProveedoresPaginados = async (req, res) => {
    let pagina = req.query.pagina || 1;
    let provider = req.query.proveedor || '';
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const proveedoresRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const [proveedores, totalItems] = await proveedoresRepo.createQueryBuilder('proveedor').skip((pagina - 1) * take)
            .take(take)
            .where("proveedor.nombre_proveedor like :name", { name: `%${provider}%` })
            .getManyAndCount();
        if (proveedores.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, proveedores, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ ok: false, message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ ok: false, message: 'Algo ha salido mal!' });
    }
};
//Agregar un nuevo proveedor
ProveedorController.AgregarProveedor = async (req, res) => {
    const { nombre, email, telefono, direccion } = req.body;
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedorExist = await proveedorRepo.findOne({ where: { nombre_proveedor: nombre } });
        if (proveedorExist) {
            return res.status(400).json({ ok: false, message: 'Ya existe una proveedor con ese nombre' });
        }
        const proveedor = new Proveedor_1.Proveedor();
        proveedor.nombre_proveedor = nombre;
        proveedor.email = email;
        proveedor.telefono = telefono;
        proveedor.direccion = direccion;
        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await class_validator_1.validate(proveedor, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ ok: false, errors });
        }
        await proveedorRepo.save(proveedor);
        //all ok 
        res.json({ ok: true, message: 'Se agrego un nuevo proveedor' });
    }
    catch (error) {
        res.status(400).json({ ok: false, message: 'Algo ha salio mal!' });
    }
};
//Obtener proveedor por ID
ProveedorController.ObtenerProveedorPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
        res.json({ ok: true, proveedor });
    }
    catch (error) {
        return res.status(404).json({ ok: false, message: 'No hay registros con este id: ' + id });
    }
};
//Actualizar un proveedor
ProveedorController.ActualizarProveedor = async (req, res) => {
    let proveedor;
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
        proveedor.nombre_proveedor = nombre,
            proveedor.email = email,
            proveedor.telefono = telefono,
            proveedor.direccion = direccion;
    }
    catch (error) {
        return res.status(404).json({ ok: false, message: 'No se han encontrado resultados con el id: ' + id });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(proveedor, ValidateOps);
    //Try to save data Category
    try {
        await proveedorRepo.save(proveedor);
        //all is ok
        res.json({ ok: true, message: 'Se actualizo el registro!' });
    }
    catch (error) {
        return res.status(409).json({ ok: false, message: 'Algo ha salido mal!' });
    }
};
//eliminar un proveedor
ProveedorController.EliminarProveedor = async (req, res) => {
    let proveedor;
    const { id } = req.params;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ ok: false, message: 'No se han encontrado resultados ' });
    }
    //intentar eliminar proveedor
    try {
        await proveedorRepo.remove(proveedor);
        //all is ok
        res.json({ ok: true, meassge: 'Proveedor ha sido eliminado!' });
    }
    catch (error) {
        return res.send({ ok: false, message: 'No puedes eliminar este proveedor porque hay registros implicados' });
    }
};
//Cambiar estado proveedor
ProveedorController.EstadoProveedor = async (req, res) => {
    let proveedor;
    const id = req.body;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = await proveedorRepo.findOneOrFail(id);
        if (proveedor.status == true) {
            proveedor.status = false;
        }
        else {
            proveedor.status = true;
        }
        const proveedorStatus = await proveedorRepo.save(proveedor);
        res.json({ ok: true, message: 'Estado de proveedor actualizado!' });
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: 'ALgo salio mal!' });
    }
};
exports.default = ProveedorController;
//# sourceMappingURL=Proveedor.js.map