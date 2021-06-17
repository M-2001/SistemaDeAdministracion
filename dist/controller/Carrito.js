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
const Producto_1 = require("../entity/Producto");
const typeorm_1 = require("typeorm");
const Order_1 = require("../entity/Order");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
let Items;
class CarritoController {
}
CarritoController.AgregarProductoCarrito = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let items = req.body;
    Items = items;
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let totalPrice = 0;
    try {
        for (let index = 0; index < items.length; index++) {
            let amount = 0;
            const item = items[index];
            const productoItem = yield proRepo.findOneOrFail(item.id);
            let operacion = productoItem.costo_standar * item.qty;
            let Totaldesc = operacion * productoItem.descuento;
            let totalPay = operacion - Totaldesc;
            amount += totalPay;
            totalPrice += totalPay;
            const OnlyTwoDecimals = amount.toFixed(2);
            console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
        }
        //req.body.map(async (p : Product, _ : any )=>{
        // try {
        //     let operacion =  productoItem.costo_standar * qty;
        //     let Totaldesc = operacion * productoItem.descuento
        //     let totalPay =  operacion - Totaldesc
        //     amount += totalPay
        //     totalPrice =+ totalPay
        //     const OnlyTwoDecimals = amount.toFixed(2);
        //     const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ''),10);
        //     console.log(OnlyTwoDecimals);
        //     console.log(productoItem);
        // } catch (error) {
        //     console.log(error);
        // }
        //});
    }
    catch (error) {
        console.log('Ocurrio un error');
    }
    //all ok
    let total = totalPrice.toFixed(2);
    res.json({ total, Items });
});
CarritoController.guardarOrden_DetalleOrden = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clienteid } = res.locals.jwtPayload;
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let totalToPay = 0;
    try {
        const or = new Order_1.Order();
        or.cliente = clienteid;
        const ordenC = yield ordenRepo.save(or);
        //console.log(ordenC);
        req.body.map((orden, _) => __awaiter(void 0, void 0, void 0, function* () {
            const { id, qty } = orden;
            //const ordenId = await ordenRepo.findOneOrFail(ordenC.id)
            //console.log(ordenId.id);
            const productoItem = yield proRepo.findOneOrFail(id);
            //console.log(productoItem.catidad_por_unidad);
            let amount = 0;
            let operacion = productoItem.costo_standar * qty;
            let qtyExist = productoItem.catidad_por_unidad - qty;
            amount += operacion;
            const OnlyTwoDecimals = amount.toFixed(2);
            const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ','), 10);
            const saveOD = new Detalles_Orden_1.DetalleOrden();
            saveOD.orden = ordenC,
                saveOD.producto = productoItem,
                saveOD.cantidad = qty,
                saveOD.totalUnidad = parseAmount;
            const Save = yield ordeDRepo.save(saveOD);
            productoItem.catidad_por_unidad = qtyExist;
            const saveProduct = yield proRepo.save(productoItem);
            console.log(saveProduct);
            // totalToPay += operacion
            // console.log(totalToPay);
        }));
    }
    catch (error) {
        console.log(error);
    }
    res.json({ ok: true, totalToPay });
});
;
exports.default = CarritoController;
//# sourceMappingURL=Carrito.js.map