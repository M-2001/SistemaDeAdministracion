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
const Proveedor_1 = require("../entity/Proveedor");
const typeorm_1 = require("typeorm");
class ProveedorController {
}
ProveedorController.MostrarProveedors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedor = yield proveedorRepo.find();
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
});
ProveedorController.MostrarProveedoresPaginados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const proveedoresRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const [proveedores, totalItems] = yield proveedoresRepo.findAndCount({ take, skip: (pagina - 1) * take });
        if (proveedores.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
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
});
ProveedorController.AgregarProveedor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nombre, email, telefono, direccion } = req.body;
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedorExist = yield proveedorRepo.findOne({ where: { nombre_proveedor: nombre } });
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
        const errors = yield class_validator_1.validate(proveedor, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        yield proveedorRepo.save(proveedor);
    }
    catch (error) {
        res.status(400).json({ message: 'Algo ha salio mal!' });
    }
    //all ok 
    res.json({ message: 'Se agrego un nuevo proveedor' });
});
ProveedorController.ObtenerProveedorPorID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
        const proveedor = yield proveedorRepo.findOneOrFail({ where: { id } });
        res.json({ proveedor });
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
ProveedorController.ActualizarProveedor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let proveedor;
    const { id } = req.params;
    const { nombre, email, telefono, direccion } = req.body;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = yield proveedorRepo.findOneOrFail({ where: { id } });
        proveedor.nombre_proveedor = nombre,
            proveedor.email = email,
            proveedor.telefono = telefono,
            proveedor.direccion = direccion;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados con el id: ' + id });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(proveedor, ValidateOps);
    //Try to save data Category
    try {
        yield proveedorRepo.save(proveedor);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Se actualizo el registro!' });
});
ProveedorController.EliminarProveedor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let proveedor;
    const { id } = req.params;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = yield proveedorRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        yield proveedorRepo.remove(proveedor);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Proveedor ha sido eliminada!' });
});
//estado proveedor
ProveedorController.EstadoProveedor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let proveedor;
    const id = req.body;
    const proveedorRepo = typeorm_1.getRepository(Proveedor_1.Proveedor);
    try {
        proveedor = yield proveedorRepo.findOneOrFail(id);
        if (proveedor.status == true) {
            proveedor.status = false;
        }
        else {
            proveedor.status = true;
        }
        const proveedorStatus = yield proveedorRepo.save(proveedor);
        res.json({ ok: true, proveedor: proveedorStatus.status });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = ProveedorController;
//# sourceMappingURL=Proveedor.js.map