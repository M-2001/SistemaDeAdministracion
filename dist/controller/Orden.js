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
const Order_1 = require("../entity/Order");
const Producto_1 = require("../entity/Producto");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
class OrdenController {
}
OrdenController.MostrarOrdenPaginadas = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const ordenesRepo = typeorm_1.getRepository(Order_1.Order);
        const [ordenes, totalItems] = yield ordenesRepo.createQueryBuilder('orden')
            .innerJoin('orden.cliente', 'cliente')
            .addSelect(['cliente.nombre', 'cliente.apellido', 'cliente.direccion'])
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        if (ordenes.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, ordenes, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
OrdenController.AddReservacion = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clienteid } = res.locals.jwtPayload;
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let items = req.body;
    let totalPrice = 0;
    let totalDesc = 0;
    try {
        const or = new Order_1.Order();
        or.cliente = clienteid;
        or.status = 0;
        const ordenC = yield ordenRepo.save(or);
        for (let index = 0; index < items.length; index++) {
            let amount = 0;
            const item = items[index];
            const productoItem = yield proRepo.findOneOrFail(item.id);
            let operacion = productoItem.costo_standar * item.qty;
            let Totaldesc = operacion * productoItem.descuento;
            let totalPay = operacion - Totaldesc;
            //let qtyExist = productoItem.catidad_por_unidad - item.qty;
            amount += totalPay;
            totalPrice += totalPay;
            totalDesc += Totaldesc;
            const OnlyTwoDecimals = amount.toFixed(2);
            const parseAmount = parseInt(OnlyTwoDecimals.replace('.', '.'), 10);
            console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
            try {
                //save Orden Detalle
                const saveOD = new Detalles_Orden_1.DetalleOrden();
                saveOD.orden = ordenC,
                    saveOD.producto = productoItem,
                    saveOD.cantidad = item.qty,
                    saveOD.totalUnidad = amount,
                    saveOD.descuento = Totaldesc;
                const Save = yield ordeDRepo.save(saveOD);
            }
            catch (error) {
                console.log(error);
            }
        }
        ordenC.PrecioTotal = totalPrice;
        ordenC.TotalDesc = totalDesc;
        const actualizarOrden = yield ordenRepo.save(ordenC);
        res.json({ ok: true, message: 'Reservacion realizada con exito!!!' });
    }
    catch (error) {
        console.log(error);
    }
    let total = totalPrice.toFixed(2);
});
//estado Orden
OrdenController.EstadoOrden = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let ordenDetalle;
    //let orderId;
    const { id } = req.params;
    const OrdenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordenDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let itemsOrden;
    try {
        const order = yield OrdenRepo.findOneOrFail({ where: { id } });
        console.log(order);
        let orden = order.id;
        if (order.status == 1 || order.status == 2) {
            return res.json({ ok: false, message: 'La orden ya fue completada!!!' });
        }
        else {
            order.status = 1;
            const OrdenComplete = yield OrdenRepo.save(order);
            try {
                ordenDetalle = yield ordenDRepo.createQueryBuilder('orden_detalle')
                    .innerJoin('orden_detalle.producto', 'producto')
                    .innerJoin('orden_detalle.orden', 'orden')
                    .addSelect(['producto.nombreProducto', 'producto.id'])
                    .addSelect(['orden.fecha_Orden', 'orden.cliente'])
                    .where({ orden })
                    .getMany();
                if (ordenDetalle.length > 0) {
                    //recorrer arreglo obtenido desde la base de datos
                    for (let index = 0; index < ordenDetalle.length; index++) {
                        const item = ordenDetalle[index];
                        let producto = item.producto.id;
                        //buscarlos productos por id
                        const productoItem = yield proRepo.findOneOrFail(producto);
                        //intentar guardar los productos con la cantidad actualizda
                        try {
                            let qtyExits = productoItem.catidad_por_unidad - item.cantidad;
                            productoItem.catidad_por_unidad = qtyExits;
                            const producto = yield proRepo.save(productoItem);
                            //res.json({message : 'Exito!', producto});
                            console.log(producto);
                        }
                        catch (error) {
                            console.log(error);
                        }
                    }
                }
                else {
                    res.json({ message: 'No se encontraron resultados!' });
                }
            }
            catch (error) {
                console.log(error);
            }
            return res.json({ ok: true, OrdenComplete });
        }
    }
    catch (error) {
        return res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
exports.default = OrdenController;
//# sourceMappingURL=Orden.js.map