"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Producto_1 = require("../entity/Producto");
const typeorm_1 = require("typeorm");
const Order_1 = require("../entity/Order");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
const mailer_1 = require("../middleware/mailer");
const PaypalSdk = require("paypal-rest-sdk");
const Cliente_1 = require("../entity/Cliente");
const Cupones_1 = require("../entity/Cupones");
PaypalSdk.configure({
    'mode': 'sandbox',
    'client_id': 'AaPEDYf8ahu1pp5C2bmNOI5882b6dBnHaG2e3ZAOf2TvR6p01Ad3v1K2npww4os2O2sbl0tKQbdn5HtT',
    'client_secret': 'EBEvKMxyW2YpshzcQbycRzHJIirGDcvs8tG_u_VD56FWzZzzNOrl_NUcgdI8bSlmvt-g4CKAL8MGANvD'
});
let Items;
class PayController {
}
//metodo de pago paypal
PayController.Pay = async (req, res) => {
    let items = req.body;
    let CODIGO_CUPON = req.query.CODIGO_CUPON;
    Items = items;
    //let CODE_CUPON = CODIGO_CUPON;
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    let totalPrice = 0;
    let cuponExist;
    try {
        //verificar CODE_CUPON
        if (CODIGO_CUPON) {
            try {
                cuponExist = await cuponRepo.findOneOrFail({ where: { codigo: CODIGO_CUPON } });
                if (cuponExist.status == true) {
                    return res.status(400).json({ ok: false, message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!' });
                }
                else {
                    try {
                        for (let index = 0; index < items.length; index++) {
                            let amount = 0;
                            const item = items[index];
                            const productoItem = await proRepo.findOneOrFail(item.id);
                            let operacion = productoItem.costo_standar * item.qt;
                            let Totaldesc = 0.00;
                            let totalPay = operacion;
                            amount += totalPay;
                            totalPrice += totalPay;
                            const OnlyTwoDecimals = amount.toFixed(2);
                        }
                    }
                    catch (error) {
                        return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
                    }
                }
            }
            catch (error) {
                return res.status(400).json({ ok: false, message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' no es valido!!!' });
            }
        }
        else {
            try {
                for (let index = 0; index < items.length; index++) {
                    let amount = 0;
                    const item = items[index];
                    const productoItem = await proRepo.findOneOrFail(item.id);
                    let operacion = productoItem.costo_standar * item.qt;
                    let Totaldesc = operacion * productoItem.descuento / 100;
                    let totalPay = operacion - Totaldesc;
                    amount += totalPay;
                    totalPrice += totalPay;
                    const OnlyTwoDecimals = amount.toFixed(2);
                }
            }
            catch (error) {
                return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
            }
        }
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
    }
    let urlSuccess;
    let total;
    if (cuponExist) {
        const Totaldesct = totalPrice * cuponExist.descuento / 100;
        const Totalprice = totalPrice - Totaldesct;
        urlSuccess = "https://client-systempc.vercel.app/pay?CODIGO_CUPON=" + CODIGO_CUPON;
        total = Totalprice.toFixed(2);
    }
    else {
        urlSuccess = "https://client-systempc.vercel.app/pay";
        total = totalPrice.toFixed(2);
    }
    //try to pay
    try {
        const create_payment = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": urlSuccess,
                "cancel_url": "https://systempcs.herokuapp.com/api/pay-checkout/cancel"
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
                throw error;
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
                    res.send({ redirectUrl });
                }
            }
        });
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
    }
};
//metodo que da continuidad al metodo de pago paypal se encarga de guardar ordenes y detalles de ordenes en base de datos
PayController.PaySuccess = async (req, res) => {
    const { clienteid } = res.locals.jwtPayload;
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let items = Items;
    let ordenC;
    let cuponExist;
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const CODIGO_CUPON = req.query.CODIGO_CUPON;
    let totalPrice = 0;
    let totalDesc = 0;
    let total;
    let descuentoCupon = 0.00;
    const itemEmail = [];
    try {
        //verificar CODE_CUPON
        if (CODIGO_CUPON) {
            try {
                cuponExist = await cuponRepo.findOneOrFail({ where: { codigo: CODIGO_CUPON } });
                if (cuponExist.status == true) {
                    return res.status(400).json({ ok: false, message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!' });
                }
                else {
                    let date = new Date();
                    let month = date.getMonth() + 1;
                    const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
                    const codigoO = 'SYSTEM_PC-' + codigoOrden + month;
                    const or = new Order_1.Order();
                    or.cliente = clienteid;
                    or.codigoOrden = codigoO;
                    or.status = 2;
                    ordenC = await ordenRepo.save(or);
                    for (let index = 0; index < items.length; index++) {
                        let amount = 0;
                        const item = items[index];
                        const productoItem = await proRepo.findOneOrFail(item.id);
                        try {
                            let operacion = productoItem.costo_standar * item.qt;
                            let Totaldesc = 0.00;
                            let totalPay = operacion;
                            let qtyExist = productoItem.catidad_por_unidad - item.qt;
                            amount += totalPay;
                            totalPrice += totalPay;
                            totalDesc += Totaldesc;
                            const OnlyTwoDecimals = amount.toFixed(2);
                            const parseAmount = parseInt(OnlyTwoDecimals.replace('.', '.'), 10);
                            let itemString = item.qt.toString();
                            let itm = { codigoOrden: ordenC.codigoOrden, cantidad: itemString, producto: productoItem.nombreProducto, precioOriginal: productoItem.costo_standar, descuento: Totaldesc, totalNto: OnlyTwoDecimals };
                            itemEmail.push(itm);
                            try {
                                //save Orden Detalle
                                const saveOD = new Detalles_Orden_1.DetalleOrden();
                                saveOD.orden = ordenC,
                                    saveOD.producto = productoItem,
                                    saveOD.cantidad = item.qt,
                                    saveOD.totalUnidad = amount,
                                    saveOD.descuento = Totaldesc;
                                const Save = await ordeDRepo.save(saveOD);
                            }
                            catch (error) {
                                return res.status(400).json({ ok: false, message: 'Algo salio mal al intentar guardar detalles de Orden!' });
                            }
                            //actualizar producto
                            try {
                                productoItem.catidad_por_unidad = qtyExist;
                                const saveProduct = await proRepo.save(productoItem);
                            }
                            catch (error) {
                                return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
                            }
                        }
                        catch (error) {
                            return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
                        }
                    }
                }
            }
            catch (error) {
                return res.status(400).json({ ok: false, message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' no es valido!!!' });
            }
        }
        else {
            //guardar Orden sin cupon
            let date = new Date();
            let month = date.getMonth() + 1;
            const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
            const codigoO = 'SYSTEM_PC-' + codigoOrden + month;
            const or = new Order_1.Order();
            or.cliente = clienteid;
            or.codigoOrden = codigoO;
            or.status = 2;
            ordenC = await ordenRepo.save(or);
            for (let index = 0; index < items.length; index++) {
                let amount = 0;
                const item = items[index];
                const productoItem = await proRepo.findOneOrFail(item.id);
                let operacion = productoItem.costo_standar * item.qt;
                let Totaldesc = operacion * productoItem.descuento / 100;
                let totalPay = operacion - Totaldesc;
                let qtyExist = productoItem.catidad_por_unidad - item.qt;
                amount += totalPay;
                totalPrice += totalPay;
                totalDesc += Totaldesc;
                const OnlyTwoDecimals = amount.toFixed(2);
                const parseAmount = parseInt(OnlyTwoDecimals.replace('.', '.'), 10);
                let itemString = item.qt.toString();
                let itm = { codigoOrden: ordenC.codigoOrden, cantidad: itemString, producto: productoItem.nombreProducto, precioOriginal: productoItem.costo_standar, descuento: Totaldesc, totalNto: OnlyTwoDecimals };
                itemEmail.push(itm);
                try {
                    //save Orden Detalle
                    const saveOD = new Detalles_Orden_1.DetalleOrden();
                    saveOD.orden = ordenC,
                        saveOD.producto = productoItem,
                        saveOD.cantidad = item.qt,
                        saveOD.totalUnidad = amount,
                        saveOD.descuento = Totaldesc;
                    const Save = await ordeDRepo.save(saveOD);
                }
                catch (error) {
                    return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
                }
                //actualizar producto
                try {
                    productoItem.catidad_por_unidad = qtyExist;
                    const saveProduct = await proRepo.save(productoItem);
                }
                catch (error) {
                    return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
                }
            }
        }
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: 'Algo salio mal!' });
    }
    if (cuponExist) {
        const Totaldesct = totalPrice * cuponExist.descuento / 100;
        const Totalprice = totalPrice - Totaldesct;
        descuentoCupon = Totaldesct;
        total = Totalprice.toFixed(2);
        ordenC.PrecioTotal = Totalprice;
        ordenC.TotalDesc = Totaldesct;
        const actualizarOrden = await ordenRepo.save(ordenC);
        cuponExist.status = true;
        const statusCupon = await cuponRepo.save(cuponExist);
        //res.json({itemEmail});
    }
    else {
        ordenC.PrecioTotal = totalPrice;
        ordenC.TotalDesc = totalDesc;
        const actualizarOrden = await ordenRepo.save(ordenC);
        total = totalPrice.toFixed(2);
    }
    //try to send email buy
    try {
        let direccionLocal = "6 Avenida Norte 3-11, Sonsonate, Sonsonate";
        let date = new Date();
        const infoCliente = await clienteRepo.findOneOrFail(clienteid);
        let subject = ` ${infoCliente.nombre + " " + infoCliente.apellido + " Gracias por su Compra!!!"} `;
        let content = itemEmail.reduce((a, b) => {
            return a + '<tr><td>' + b.cantidad + '</td><td>' + b.producto + '</td><td>' + '$' + b.precioOriginal + '</td><td>' + '$' + b.descuento + '</td><td>' + '$' + b.totalNto + '</td></tr>';
        }, '');
        let descTotal = itemEmail.map((a) => a.descuento).reduce((a, b) => a + b);
        await mailer_1.transporter.sendMail({
            from: `"System-PC Sonsonate" <castlem791@gmail.com>`,
            to: infoCliente.email,
            subject: subject,
            html: ` <!DOCTYPE html>
                        <html lang="en">
                        <head> </head>
                        <body><div>
                        <h3>Gracias por su Compra!!!</h3>
                        <h4>Comprador:</h4>
                <p>Nombre: ${infoCliente.nombre + " " + infoCliente.apellido}</p>
                <p>Email : ${infoCliente.email}</p>
                <p>Dia Compra : ${date}</p>
                <p>Codigo Orden: ${ordenC.codigoOrden}</p>

                <h4>Vendido Por: </h4>
                <p>Dirección Compra : </p>
                <p>System-Pc Sonsonate, ${direccionLocal}</p>
                <p>Productos incluidos en compra: </p>

                <table style = "border: hidden" >
                    <thead class="tablahead" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
                    <tr>
                    <th id="cantidad">Cantidad</th>
                    <th id="producto">Producto</th>
                    <th id="precioO">Precio Original</th>
                    <th id="desc">Descuento por producto</th>
                    <th id="TotalNto">Total Nto</th>
                    </tr>
                </thead>
                <tbody id="bodytabla">

                ${content}

                </tbody>
                </table>
                <p>Descuento Total : $${totalDesc}</p>

                <p>Descuento en Cupon : $${descuentoCupon}</p>

                <p>Total compra: $${total}</p>
                <a href="${"Link tienda"}">Visitanos pronto !!!</a>
                </div>
                </body>
                </html>`
        });
    }
    catch (error) {
        return console.log('Algo salio mal al intentar enviar email!!!');
    }
    //Proceso Paypal
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
                throw error;
            }
            else {
                res.json({ ok: true, message: 'Gracias por su compra' });
            }
        });
    }
    catch (error) {
        return res.status(400).json({ ok: false, message: 'Algo ha fallado a hacer la compra' });
    }
};
exports.default = PayController;
//# sourceMappingURL=Pay.js.map