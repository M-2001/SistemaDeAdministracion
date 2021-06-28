"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const class_validator_1 = require("class-validator");
const Proveedor_1 = require("../entity/Proveedor");
const typeorm_1 = require("typeorm");
class ProveedorController {
}
ProveedorController.MostrarProveedors = async (_, res) => {
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedor = await proveedorRepo.find();
        if (proveedor.length > 0) {
            res.json(proveedor);
        }
        else {
            res.json({ message: 'No se encontraron resultados' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal' });
    }
};
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
            console.log(proveedores.length);
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
};
ProveedorController.AgregarProveedor = async (req, res) => {
    const { nombre, email, telefono, direccion } = req.body;
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedorExist = await proveedorRepo.findOne({ where: { nombre_proveedor: nombre } });
        console.log(proveedorExist);
        if (proveedorExist) {
            return res.status(400).json({ message: 'Ya existe una proveedor con ese nombre' });
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
            return res.status(400).json({ errors });
        }
        await proveedorRepo.save(proveedor);
    }
    catch (error) {
        res.status(400).json({ message: 'Algo ha salio mal!' });
    }
    //all ok 
    res.json({ message: 'Se agrego un nuevo proveedor' });
};
ProveedorController.ObtenerProveedorPorID = async (req, res) => {
    const { id } = req.params;
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
        res.json({ proveedor });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
};
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
        return res.status(404).json({ message: 'No se han encontrado resultados con el id: ' + id });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = await class_validator_1.validate(proveedor, ValidateOps);
    //Try to save data Category
    try {
        await proveedorRepo.save(proveedor);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Se actualizo el registro!' });
};
ProveedorController.EliminarProveedor = async (req, res) => {
    let proveedor;
    const { id } = req.params;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        await proveedorRepo.remove(proveedor);
    }
    catch (error) {
        return res.send({ message: 'No puedes eliminar este proveedor porque hay registros implicados' });
    }
    res.json({ messge: 'Proveedor ha sido eliminada!', ok: true });
};
//estado proveedor
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
        res.json({ ok: true, proveedor: proveedorStatus.status });
    }
    catch (error) {
        console.log(error);
    }
};
exports.default = ProveedorController;
//# sourceMappingURL=Proveedor.js.map