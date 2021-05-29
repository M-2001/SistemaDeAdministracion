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
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
const Orden_1 = require("./Orden");
const stripe_1 = require("stripe");
const stripe = new stripe_1.default(process.env.SECRETKEYSTRIPE, { apiVersion: '2020-08-27', });
const orden = Orden_1.default;
//const stripe = require('stripe')(process.env.SECRETKEYSTRIPE);
class OrdenDetalle {
}
OrdenDetalle.MostrarDteOrdenPaginadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const ordenesDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
        const [ordenesD, totalItems] = yield ordenesDRepo.createQueryBuilder('orden_detalle')
            .innerJoin('orden_detalle.producto', 'producto')
            .innerJoin('orden_detalle.orden', 'orden')
            .addSelect(['producto.nombreProducto'])
            .addSelect(['orden.fecha_Orden', 'orden.cliente'])
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        if (ordenesD.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, ordenesD, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
OrdenDetalle.MostrarDteOrderByOrderId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { orden } = req.body;
    try {
        const ordenesDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
        const ordenesD = yield ordenesDRepo.createQueryBuilder('orden_detalle')
            .innerJoin('orden_detalle.producto', 'producto')
            .innerJoin('orden_detalle.orden', 'orden')
            .addSelect(['producto.nombreProducto'])
            .addSelect(['orden.fecha_Orden', 'orden.cliente'])
            .where({ orden })
            .getMany();
        if (ordenesD.length > 0) {
            res.json({ ok: true, ordenesD });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
exports.default = OrdenDetalle;
//# sourceMappingURL=OrdenDetalle.js.map