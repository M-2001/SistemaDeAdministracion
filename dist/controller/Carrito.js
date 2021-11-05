"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Producto_1 = require("../entity/Producto");
const typeorm_1 = require("typeorm");
const Order_1 = require("../entity/Order");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
let Items;
class CarritoController {
}
//Agregar productos al carrito
CarritoController.AgregarProductoCarrito = async (req, res) => {
    let items = req.body;
    Items = items;
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let totalPrice = 0;
    try {
        for (let index = 0; index < items.length; index++) {
            let amount = 0;
            const item = items[index];
            const productoItem = await proRepo.findOneOrFail(item.id);
            let operacion = productoItem.costo_standar * item.qty;
            let Totaldesc = operacion * productoItem.descuento;
            let totalPay = operacion - Totaldesc;
            amount += totalPay;
            totalPrice += totalPay;
            const OnlyTwoDecimals = amount.toFixed(2);
            console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
        }
        //all ok
        let total = totalPrice.toFixed(2);
        res.json({ ok: true, total, Items });
    }
    catch (error) {
        return res
            .status(400)
            .json({ ok: false, message: "Algo salio mal!" });
    }
};
//guardar orden detalle
CarritoController.guardarOrden_DetalleOrden = async (req, res) => {
    const { clienteid } = res.locals.jwtPayload;
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let totalToPay = 0;
    try {
        const or = new Order_1.Order();
        or.cliente = clienteid;
        const ordenC = await ordenRepo.save(or);
        //console.log(ordenC);
        req.body.map(async (orden, _) => {
            const { id, qty } = orden;
            //const ordenId = await ordenRepo.findOneOrFail(ordenC.id)
            //console.log(ordenId.id);
            const productoItem = await proRepo.findOneOrFail(id);
            //console.log(productoItem.catidad_por_unidad);
            let amount = 0;
            let operacion = productoItem.costo_standar * qty;
            let qtyExist = productoItem.catidad_por_unidad - qty;
            amount += operacion;
            const OnlyTwoDecimals = amount.toFixed(2);
            const parseAmount = parseInt(OnlyTwoDecimals.replace(".", ","), 10);
            const saveOD = new Detalles_Orden_1.DetalleOrden();
            (saveOD.orden = ordenC),
                (saveOD.producto = productoItem),
                (saveOD.cantidad = qty),
                (saveOD.totalUnidad = parseAmount);
            const Save = await ordeDRepo.save(saveOD);
            productoItem.catidad_por_unidad = qtyExist;
            const saveProduct = await proRepo.save(productoItem);
            // totalToPay += operacion
            // console.log(totalToPay);
        });
    }
    catch (error) {
        return res
            .status(400)
            .json({ ok: false, message: "Algo salio mal!" });
    }
    res.json({ ok: true, totalToPay });
};
exports.default = CarritoController;
//# sourceMappingURL=Carrito.js.map