import { Request, Response } from 'express';
import CarritoController from './Carrito';
import { Producto } from '../entity/Producto';
import { getRepository } from 'typeorm';
import { Order } from '../entity/Order';
import { DetalleOrden } from '../entity/Detalles_Orden';
import { transporter } from '../config/nodemailer.config';
import PaypalSdk = require('paypal-rest-sdk');
import { Cliente } from '../entity/Cliente';
import { Cupon } from '../entity/Cupones';
import ItemProducto from '../entity/ItemEmail';

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

class PayController{

    static Pay = async( req : Request, res: Response) =>{

            let items : Product[] = req.body;
            let CODIGO_CUPON = req.query.code;
            Items = items;
            //let CODE_CUPON = CODIGO_CUPON;
            const proRepo =  getRepository(Producto);
            const cuponRepo = getRepository(Cupon);
            let totalPrice : number = 0;
            let cuponExist: Cupon;

            try {
                //verificar CODE_CUPON
                if (CODIGO_CUPON) {
                    try {
                        cuponExist = await cuponRepo.findOneOrFail({where: { codigo :CODIGO_CUPON}});
                        if (cuponExist.status == true) {
                            return res.status(400).json({message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!'});
                        } else {
                            try {
                                for (let index = 0; index < items.length; index++) {
                                    let amount: number = 0;
                                    const item = items[index];
                                    const productoItem = await proRepo.findOneOrFail(item.id);
                        
                                    let operacion = productoItem.costo_standar * item.qt;
                                    let Totaldesc = 0.00;
                                    let totalPay =  operacion;
    
                                    amount += totalPay
                                    totalPrice += totalPay
                                    const OnlyTwoDecimals = amount.toFixed(2);
                                    
                                    console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
                            }
                            } catch (error) {
                                return console.log('Algo salio mal!!!');
                            }
                        }
                    } catch (error) {
                        return res.status(400).json({message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' no es valido!!!'});
                    }
                } else {
                    try {
                        for (let index = 0; index < items.length; index++) {
                            let amount: number = 0;
                            const item = items[index];
                            const productoItem = await proRepo.findOneOrFail(item.id);
                
                            let operacion = productoItem.costo_standar * item.qt;
                            let Totaldesc = operacion * productoItem.descuento/100;
                            let totalPay =  operacion - Totaldesc;
                            amount += totalPay
                            totalPrice += totalPay
                            const OnlyTwoDecimals = amount.toFixed(2);

                            console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);
                    }
                    } catch (error) {
                        return console.log('Algo salio mal!!!');
                    }
                    
                    
                }
            } catch (error) {
                return console.log('Algo salio mal');
            }
            let urlSuccess : any;
            let total : string;
            if (cuponExist) {
                const Totaldesct = totalPrice * cuponExist.descuento/100;
                const Totalprice = totalPrice - Totaldesct;
                urlSuccess = "https://systempcs.herokuapp.com/api/pay?code=" + CODIGO_CUPON;
                total = Totalprice.toFixed(2)
            } else {
                urlSuccess = "https://systempcs.herokuapp.com/api/pay";
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
                }
                PaypalSdk.payment.create(create_payment, function(error: any, payment : any){
                    if (error) {
                        //throw error;

                        console.log('Esto no funciona');

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
                    }
                });
            } catch (error) {
                return console.log('Algo salio mal!!!');
            }
    }

    static PaySuccess = async(req : Request, res : Response) => {
        const {clienteid} = res.locals.jwtPayload;
        const ordenRepo = getRepository(Order);
        const ordeDRepo = getRepository(DetalleOrden);
        const proRepo = getRepository(Producto);
        const cuponRepo = getRepository(Cupon);
        const clienteRepo = getRepository(Cliente);

        let items = Items;
        let ordenC: Order;
        let cuponExist: Cupon;

        //var params = new URLSearchParams(location.search);
        
        const payerId : any = req.query.PayerID;
        const paymentId : any = req.query.paymentId;
        const CODIGO_CUPON : any = req.query.code;
        let totalPrice : number = 0;
        let totalDesc : number = 0;
        let total : any;
        let descuentoCupon: number = 0.00;
        

        const itemEmail : ItemProducto[] = [];

        try {
            //verificar CODE_CUPON
            if (CODIGO_CUPON) {
                
                try {
                    cuponExist = await cuponRepo.findOneOrFail({where:{codigo : CODIGO_CUPON}});
                    if(cuponExist.status == true){
                        return res.status(400).json({message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!'});
                    } else {
                        let date = new Date();
                        let month = date.getMonth() + 1;
                        const codigoOrden = Math.floor(Math.random()* 90000) + 10000;
                        const codigoO = 'SYSTEM_PC-'+ codigoOrden + month;

                        const or = new Order();
                        or.cliente = clienteid;
                        or.codigoOrden = codigoO;
                        or.status = 2
                        ordenC = await ordenRepo.save(or);

                        for (let index = 0; index < items.length; index++) {
                            let amount: number = 0;
                            const item = items[index];
                            const productoItem = await proRepo.findOneOrFail(item.id);
                            try {
                                let operacion = productoItem.costo_standar * item.qt;
                                let Totaldesc = 0.00;
                                let totalPay =  operacion;
                                let qtyExist = productoItem.catidad_por_unidad - item.qt;

                                amount += totalPay
                                totalPrice += totalPay
                                totalDesc += Totaldesc
                                const OnlyTwoDecimals = amount.toFixed(2);
                                const parseAmount = parseInt(OnlyTwoDecimals.replace('.', '.'),10);
                                console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);

                                let itemString : string = item.qt.toString()
                                
                                let itm  = {codigoOrden: ordenC.codigoOrden, cantidad : itemString, producto: productoItem.nombreProducto, precioOriginal: productoItem.costo_standar, descuento: Totaldesc, totalNto: OnlyTwoDecimals}
            
                                itemEmail.push(itm)

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
                                //actualizar producto
                                try {
                                    productoItem.catidad_por_unidad = qtyExist;
                                    const saveProduct = await proRepo.save(productoItem)
                                    
                                } catch (error) {
                                    return console.log('Error inesperado!!!');
                                }
                            } catch (error) {
                                return console.log('Algo salio mal!!!');
                            }
                                console.log(productoItem);
                        }
                    }
                } catch (error) {
                    return res.status(400).json({message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' no es valido!!!'});
                }
            } else {
                //guardar Orden sin cupon
                let date = new Date();
                let month = date.getMonth() + 1;
                const codigoOrden = Math.floor(Math.random()* 90000) + 10000;
                const codigoO = 'SYSTEM_PC-'+ codigoOrden + month;

                const or = new Order();
                or.cliente = clienteid;
                or.codigoOrden = codigoO;
                or.status = 2
                ordenC = await ordenRepo.save(or);
                for (let index = 0; index < items.length; index++) {
                    let amount: number = 0;
                    const item = items[index];
                    const productoItem = await proRepo.findOneOrFail(item.id);
                    let operacion = productoItem.costo_standar * item.qt;
                    let Totaldesc = operacion * productoItem.descuento/100;
                    let totalPay =  operacion - Totaldesc;
                    let qtyExist = productoItem.catidad_por_unidad - item.qt;

                    amount += totalPay
                    totalPrice += totalPay
                    totalDesc += Totaldesc
                    const OnlyTwoDecimals = amount.toFixed(2);
                    const parseAmount = parseInt(OnlyTwoDecimals.replace('.', '.'),10);
                    console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);

                    let itemString : string = item.qt.toString()
                    
                    let itm  = {codigoOrden: ordenC.codigoOrden, cantidad : itemString, producto: productoItem.nombreProducto, precioOriginal: productoItem.costo_standar, descuento: Totaldesc, totalNto: OnlyTwoDecimals}

                    itemEmail.push(itm)
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
                    //actualizar producto
                    try {
                        productoItem.catidad_por_unidad = qtyExist;
                        const saveProduct = await proRepo.save(productoItem)
                        
                    } catch (error) {
                        return console.log('Error inesperado!!!');
                    }
                    }
            }
        } catch (error) {
            return console.log('Ocurrio un error inesperado!!!');
        }

        if (cuponExist) {
            const Totaldesct = totalPrice * cuponExist.descuento/100;
            const Totalprice = totalPrice - Totaldesct;
            console.log(Totaldesct, Totalprice);
            descuentoCupon = Totaldesct;
            total = Totalprice.toFixed(2)

            ordenC.PrecioTotal = Totalprice;
            ordenC.TotalDesc = Totaldesct;
            
            const actualizarOrden = await ordenRepo.save(ordenC);


            cuponExist.status = true; 
            const statusCupon = await cuponRepo.save(cuponExist);
            //res.json({itemEmail});
        } else{
            ordenC.PrecioTotal = totalPrice;
            ordenC.TotalDesc = totalDesc 
            const actualizarOrden = await ordenRepo.save(ordenC)
            total = totalPrice.toFixed(2);
            //res.json({itemEmail});
        }
        

        //try to send email buy

        try {
            let direccionLocal : string = "6 Avenida Norte 3-11, Sonsonate, Sonsonate";
            let date = new Date();
            const infoCliente = await clienteRepo.findOneOrFail(clienteid.id)
            let subject : string = ` ${infoCliente.nombre + " " + infoCliente.apellido + " Gracias por su Compra!!!"} `
            console.log(subject);
            console.log(direccionLocal, date, infoCliente);
            

            let content = itemEmail.reduce((a,b) => {
                return a + '<tr><td>' + b.cantidad + '</td><td>' + b.producto + '</td><td>' + '$'+b.precioOriginal + '</td><td>' + '$'+b.descuento + '</td><td>' + '$'+ b.totalNto + '</td></tr>';
            }, '');

            let descTotal = itemEmail.map((a) => a.descuento ).reduce((a,b)=>a+b)
                console.log(descTotal);
            

            await transporter.sendMail({
                from : `"System-PC Sonsonate" <castlem791@gmail.com>`, //sender address
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
        } catch (error) {
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