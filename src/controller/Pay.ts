import { Request, Response } from 'express';
import CarritoController from './Carrito';
import { Producto } from '../entity/Producto';
import { getRepository } from 'typeorm';
import { Order } from '../entity/Order';
import { DetalleOrden } from '../entity/Detalles_Orden';
import PaypalSdk = require('paypal-rest-sdk');


const carrito = CarritoController;

PaypalSdk.configure({
    'mode':'sandbox',//sandbox or live
    'client_id': 'AaPEDYf8ahu1pp5C2bmNOI5882b6dBnHaG2e3ZAOf2TvR6p01Ad3v1K2npww4os2O2sbl0tKQbdn5HtT',
    'client_secret': 'EBEvKMxyW2YpshzcQbycRzHJIirGDcvs8tG_u_VD56FWzZzzNOrl_NUcgdI8bSlmvt-g4CKAL8MGANvD'
});

interface Product {
    id ?: string,
    qt: number
}

let Items : any;
let Token : any

class PayController{

    static Pay = async(req : Request, res: Response) =>{

            let items : Product[] = req.body;
            Items = items;
            const proRepo =  getRepository(Producto)
            let totalPrice : number = 0;

            try {
                for (let index = 0; index < items.length; index++) {
                let amount: number = 0;
                const item = items[index];
                const productoItem = await proRepo.findOneOrFail(item.id);

                let operacion = productoItem.costo_standar * item.qt;
                let Totaldesc = operacion * productoItem.descuento / 100
                let totalPay =  operacion - Totaldesc
                amount += totalPay
                totalPrice += totalPay
                const OnlyTwoDecimals = amount.toFixed(2);
                    //Items.push(items)
                console.log("price: ",OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
            }
            } catch (error) {
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
                        "return_url": "http://localhost:3000/pay",
                        "cancel_url": "http://localhost:3080/api/pay-checkout/cancel"
                        },
                    "transactions": [{
                        "amount": {
                            "currency": "USD",
                            "total": total
                            },
                    "description": " This is the payment description "
                    }]
                }
                PaypalSdk.payment.create(create_payment, function(error: any, payment : any){
                    if (error) {
                        //throw error;
                        console.log('Esto no funciona',error.response.details);
                    } else {
                        if(create_payment.payer.payment_method === "paypal"){
                            var redirectUrl;
                            for (let index = 0; index < payment.links.length; index++) {
                                var link = payment.links[index];
                                if(link.method === 'REDIRECT'){
                                    redirectUrl = link.href;
                                    //res.redirect(payment.links[index].href)
                                }
                            }
                            res.send({redirectUrl})
                        }
                        // for (let index = 0; index < payment.links.length; index++) {
                        //     if(payment.links[index].rel === 'approval-url'){
                        //         res.redirect(payment.links[index].href)
                        //     }
                        //     console.log(payment);
                        // }
                    }
                });
            } catch (error) {
                console.log(error);
            }
    }

    static PaySuccess = async(req : Request, res : Response) => {
        const {clienteid} = res.locals.jwtPayload;
        const ordenRepo = getRepository(Order);
        const ordeDRepo = getRepository(DetalleOrden)
        const proRepo = getRepository(Producto);
        let items = req.body;
        const payerId : any = req.query.PayerID;
        const paymentId : any = req.query.paymentId;
        let totalPrice : number = 0;
        let totalDesc : number = 0;
        
        try {
            const or = new Order();
            or.cliente = clienteid;
            or.status = 2
            const ordenC = await ordenRepo.save(or);

            for (let index = 0; index < items.length; index++) {
                let amount: number = 0;
                const item = items[index];
                const productoItem = await proRepo.findOneOrFail(item.id);

                let operacion = productoItem.costo_standar * item.qt;
                let Totaldesc = operacion * productoItem.descuento / 100
                let totalPay =  operacion - Totaldesc
                let qtyExist = productoItem.catidad_por_unidad - item.qt;

                    amount += totalPay
                    totalPrice += totalPay
                    totalDesc += Totaldesc
                    try {
                        //save Orden Detalle
                        const saveOD = new DetalleOrden();
                        saveOD.orden = ordenC,
                        saveOD.producto = productoItem,
                        saveOD.cantidad = item.qt,
                        saveOD.totalUnidad = amount,
                        saveOD.descuento = Totaldesc
        
                        const Save = await ordeDRepo.save(saveOD);
                    } catch (error) {
                        console.log(error);
                    }
                    
                    productoItem.catidad_por_unidad = qtyExist;
                    
                    const saveProduct = await proRepo.save(productoItem)
    
                    console.log(productoItem);
            }
                ordenC.PrecioTotal = totalPrice;
                ordenC.TotalDesc = totalDesc;
                const actualizarOrden = await ordenRepo.save(ordenC)

        } catch (error) {
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
        PaypalSdk.payment.execute(paymentId, execute_payment, function (error: any, payment: any) {
            if (error) {
                console.log(error.response);
                throw error;
            } else {
                res.json({ message : 'Gracias por su compra',ok:true});
            }
        });
        } catch (error) {
            console.log(error);
        }
    }
}
export default PayController;