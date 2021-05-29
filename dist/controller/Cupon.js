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
const typeorm_1 = require("typeorm");
const Cupones_1 = require("../entity/Cupones");
class CuponController {
}
//crear cupon de descuento
CuponController.CrearCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let newCupon;
    try {
        const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
        let date = new Date();
        let month = date.getMonth() + 1;
        const codigoCupon = Math.floor(Math.random() * 90000) + 10000;
        const codigo = 'SYSTEM_PC-' + codigoCupon + month;
        const { descuento } = req.body;
        const cupon = new Cupones_1.Cupon();
        cupon.codigo = codigo,
            cupon.descuento = descuento,
            newCupon = yield cuponRepo.save(cupon);
        //all is ok
        res.json({ ok: true, message: 'Cupon Creado con exito', newCupon });
        console.log(newCupon);
    }
    catch (error) {
        console.log(error);
    }
});
CuponController.EstadoCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cupon;
    const id = req.body;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = yield cuponRepo.findOneOrFail(id);
        if (cupon.status == true) {
            cupon.status = false;
        }
        else {
            cupon.status = true;
        }
        const cuponStatus = yield cuponRepo.save(cupon);
        res.json({ ok: true, cupon: cuponStatus.status });
    }
    catch (error) {
        console.log(error);
    }
});
CuponController.MostrarCupones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cupon;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = yield cuponRepo.findAndCount();
        if (cupon.length > 0) {
            res.json({ ok: true, cupon });
        }
        else {
            res.json({ message: ' No se encontraron resultados' });
        }
    }
    catch (error) {
        console.log(error);
    }
});
//mostrar cupones Pajinados
CuponController.MostrarCuponesPaginados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
        const [cupones, totalItems] = yield cuponRepo.findAndCount({ take, skip: (pagina - 1) * take });
        if (cupones.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, cupones, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
//eliminar Cupon
CuponController.EliminarCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cupon;
    const { id } = req.body;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = yield cuponRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        yield cuponRepo.remove(cupon);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Cupon ha sido eliminado!' });
});
exports.default = CuponController;
//# sourceMappingURL=Cupon.js.map