"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
class OrdenDetalle {
}
OrdenDetalle.MostrarDteOrdenPaginadas = async (req, res) => {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const ordenesDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
        const [ordenesD, totalItems] = await ordenesDRepo.createQueryBuilder('orden_detalle')
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
};
OrdenDetalle.MostrarDteOrderByOrderId = async (req, res) => {
    const { orden } = req.body;
    try {
        const ordenesDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
        const ordenesD = await ordenesDRepo.createQueryBuilder('orden_detalle')
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
};
exports.default = OrdenDetalle;
//# sourceMappingURL=OrdenDetalle.js.map