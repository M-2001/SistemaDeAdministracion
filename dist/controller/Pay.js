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
const Carrito_1 = require("./Carrito");
const Producto_1 = require("../entity/Producto");
const typeorm_1 = require("typeorm");
const Order_1 = require("../entity/Order");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
const PaypalSdk = require("paypal-rest-sdk");
const carrito = Carrito_1.default;
PaypalSdk.configure({
    'mode': 'sandbox',
    'client_id': 'AaPEDYf8ahu1pp5C2bmNOI5882b6dBnHaG2e3ZAOf2TvR6p01Ad3v1K2npww4os2O2sbl0tKQbdn5HtT',
    'client_secret': 'EBEvKMxyW2YpshzcQbycRzHJIirGDcvs8tG_u_VD56FWzZzzNOrl_NUcgdI8bSlmvt-g4CKAL8MGANvD'
});
let Items;
class PayController {
}
PayController.Pay = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
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
            //Items.push(items)
            console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
        }
    }
    catch (error) {
        console.log(error);
    }
    let total = totalPrice.toFixed(2);
    //res.json({ total });
    //try to pay
    try {
        const create_payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": "http://localhost:8081/pay-checkout/success",
                "cancel_url": "http://localhost:8081/pay-checkout/cancel"
            },
            "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": total
                    },
                    "description": " This is the payment description "
                }]
        };
        PaypalSdk.payment.create(create_payment, function (error, payment) {
            if (error) {
                //throw error;
                console.log('Esto no funciona');
            }
            else {
                if (create_payment.payer.payment_method === "paypal") {
                    var redirectUrl;
                    for (let index = 0; index < payment.links.length; index++) {
                        var link = payment.links[index];
                        if (link.method === 'REDIRECT') {
                            redirectUrl = link.href;
                            //res.redirect(payment.links[index].href)
                        }
                    }
                    res.redirect(redirectUrl);
                }
                // for (let index = 0; index < payment.links.length; index++) {
                //     if(payment.links[index].rel === 'approval-url'){
                //         res.redirect(payment.links[index].href)
                //     }
                //     console.log(payment);
                // }
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
PayController.PaySuccess = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { clienteid } = res.locals.jwtPayload;
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let items = Items;
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    let totalPrice = 0;
    let totalDesc = 0;
    try {
        const or = new Order_1.Order();
        or.cliente = clienteid;
        or.status = 2;
        const ordenC = yield ordenRepo.save(or);
        for (let index = 0; index < items.length; index++) {
            let amount = 0;
            const item = items[index];
            const productoItem = yield proRepo.findOneOrFail(item.id);
            let operacion = productoItem.costo_standar * item.qty;
            let Totaldesc = operacion * productoItem.descuento;
            let totalPay = operacion - Totaldesc;
            let qtyExist = productoItem.catidad_por_unidad - item.qty;
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
            productoItem.catidad_por_unidad = qtyExist;
            const saveProduct = yield proRepo.save(productoItem);
            console.log(productoItem);
        }
        ordenC.PrecioTotal = totalPrice;
        ordenC.TotalDesc = totalDesc;
        const actualizarOrden = yield ordenRepo.save(ordenC);
        //res.json({ok: true, message:'Compra Exitosa!!!'});
    }
    catch (error) {
        console.log(error);
    }
    let total = totalPrice.toFixed(2);
    try {
        const execute_payment = {
            "payer_id": payerId,
            "transactions": [{
                    "amount": {
                        "currency": "USD",
                        "total": total
                    }
                }]
        };
        PaypalSdk.payment.execute(paymentId, execute_payment, function (error, payment) {
            if (error) {
                console.log(error.response);
                throw error;
            }
            else {
                console.log(JSON.stringify(payment));
                res.json({ message: 'Compra Exitosa!!!' });
            }
        });
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = PayController;
//# sourceMappingURL=Pay.js.map