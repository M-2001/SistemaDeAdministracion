import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Order } from '../entity/Order';
import { Producto } from '../entity/Producto';
import { DetalleOrden } from '../entity/Detalles_Orden';
import { Cliente } from '../entity/Cliente';
import { transporter } from '../config/nodemailer.config';
import ItemProducto from '../entity/ItemEmail';
import { Cupon } from '../entity/Cupones';
import { Employee } from '../entity/Employee';


interface Product {
    id?: string,
    qt: number
}

class OrdenController {

    static MostrarOrdenes =  async ( req : Request, res : Response ) => {
        try{
            const ordenRepo = getRepository(Order)
            const orders = await ordenRepo.find()
            return res.send({ok:true,orders})
        }catch{
            return res.send({error:false,message:"error en el servidor"})
                    }
    }
    //mostrar ordenes Paginadas
    static MostrarOrdenPaginadas = async ( req : Request, res : Response ) => {
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        let searchOrden = req.query.searchOrden || "";
        take = Number(take);
        try {
            const ordenesRepo = getRepository(Order);
            const [ordenes, totalItems] = await ordenesRepo.createQueryBuilder('orden')
                .innerJoin('orden.cliente', 'cliente')
                .addSelect(['cliente.nombre', 'cliente.apellido', 'cliente.direccion'])
                .skip((pagina - 1) * take)
                .take(take)
                .where("orden.codigoOrden like :codeOrden", { codeOrden: `%${searchOrden}%` })
                .getManyAndCount()

            if (ordenes.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                res.json({ ok: true, ordenes, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
            } else {
                res.json({ message: 'No se encontraron resultados!' })
            }
        } catch (error) {
            console.log(error)
            res.json({ message: 'Algo ha salido mal!' })
        }
    }

    //mostrar ordenes por clientes
    static MostrarOrdenCliente = async (req: Request, res: Response) => {
        const { clienteid } = res.locals.jwtPayload;
        let pagina = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const ordenesRepo = getRepository(Order);
            const [ordenes, totalItems] = await ordenesRepo.createQueryBuilder('orden')
                .innerJoin('orden.cliente', 'cliente')
                .addSelect(['cliente.nombre', 'cliente.apellido', 'cliente.direccion'])
                .where("orden.clienteId = :id", { id: clienteid })
                .skip((pagina - 1) * take)
                .take(take)
                .getManyAndCount()
            if (ordenes.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                return res.json({ ok: true, ordenes, totalItems, totalPages, currentPage: pagina, nextPage, prevPage })
            } else {
                return res.json({ message: 'No se encontraron resultados!' })
            }
        } catch (error) {

            console.log(error)
            return res.json({ message: 'Algo ha salido mal!',error })
        }
    }

    //agregar Reservacion
    static AddReservacion = async (req: Request, res: Response) => {
        const { clienteid } = res.locals.jwtPayload;
        const ordenRepo = getRepository(Order);
        const ordeDRepo = getRepository(DetalleOrden)
        const proRepo = getRepository(Producto);
        const clienteRepo = getRepository(Cliente);
        const cuponRepo = getRepository(Cupon);
        let CODIGO_CUPON = req.query.CODIGO_CUPON;
        let cuponExist: Cupon;
        let ordenC: Order;
        let items: Product[] = req.body;

        let totalPrice: number = 0;
        let totalDesc: number = 0;
        let total: any;
        let descuentoCupon: number = 0.00;

        const itemEmail: ItemProducto[] = [];

        try {
            //verificar CODE_CUPON
            if (CODIGO_CUPON) {
                try {
                    cuponExist = await cuponRepo.findOneOrFail({ where: { codigo: CODIGO_CUPON } });
                    if (cuponExist.status == true) {
                        return res.status(400).json({ message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!' });
                    } else {
                        let date = new Date();
                        let month = date.getMonth() + 1;
                        const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
                        const codigoO = 'SYSTEM_PC-' + codigoOrden + month;

                        const or = new Order();
                        or.cliente = clienteid;
                        or.codigoOrden = codigoO;
                        or.status = 0
                        ordenC = await ordenRepo.save(or);

                        for (let index = 0; index < items.length; index++) {
                            let amount: number = 0;
                            const item = items[index];
                            const productoItem = await proRepo.findOneOrFail(item.id);

                            try {
                                let operacion = productoItem.costo_standar * item.qt;
                                let Totaldesc = 0.00;
                                let totalPay = operacion;
                                //let qtyExist = productoItem.catidad_por_unidad - item.qty;

                                amount += totalPay
                                totalPrice += totalPay
                                totalDesc += Totaldesc
                                const OnlyTwoDecimals = amount.toFixed(2);
                                console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);

                                let itemString: string = item.qt.toString()

                                let itm = { codigoOrden: ordenC.codigoOrden, cantidad: itemString, producto: productoItem.nombreProducto, precioOriginal: productoItem.costo_standar, descuento: Totaldesc, totalNto: OnlyTwoDecimals }

                                itemEmail.push(itm)

                                try {
                                    //save Orden Detalle
                                    const saveOD = new DetalleOrden();
                                    saveOD.orden = ordenC,
                                    saveOD.producto = productoItem,
                                    saveOD.cantidad = item.qt,
                                    saveOD.totalUnidad = amount,
                                    saveOD.descuento = Totaldesc
                                    await ordeDRepo.save(saveOD);
                                } catch (error) {
                                    console.log(error);
                                }
                            } catch (error) {
                                return console.log('Algo salio mal!!!');
                            }
                        }
                    }
                    //Guardar Orden

                    console.log(cuponExist);

                } catch (error) {
                    return res.status(400).json({ message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' no es valido!!!' });
                }
            } else {
                //Guardar Orden
                let date = new Date();
                let month = date.getMonth() + 1;
                const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
                const codigoO = 'SYSTEM_PC-' + codigoOrden + month;

                const or = new Order();
                or.cliente = clienteid;
                or.codigoOrden = codigoO
                or.status = 0
                ordenC = await ordenRepo.save(or);

                for (let index = 0; index < items.length; index++) {
                    let amount: number = 0;
                    const item = items[index];
                    const productoItem = await proRepo.findOneOrFail(item.id);

                    let operacion = productoItem.costo_standar * item.qt;
                    let Totaldesc = operacion * productoItem.descuento / 100;
                    let totalPay = operacion - Totaldesc
                    //let qtyExist = productoItem.catidad_por_unidad - item.qty;

                    amount += totalPay
                    totalPrice += totalPay
                    totalDesc += Totaldesc
                    const OnlyTwoDecimals = amount.toFixed(2);
                    console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);

                    let itemString: string = item.qt.toString()

                    let itm = { codigoOrden: ordenC.codigoOrden, cantidad: itemString, producto: productoItem.nombreProducto, precioOriginal: productoItem.costo_standar, descuento: Totaldesc, totalNto: OnlyTwoDecimals }

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
                }
            }

        } catch (error) {
            return console.log('Ocurrio un error inesperado!!!');
        }
        if (cuponExist) {
            const Totaldesc = totalPrice * cuponExist.descuento / 100;
            const Totalprice = totalPrice - Totaldesc;
            console.log(Totaldesc, Totalprice);
            descuentoCupon = Totaldesc;
            total = Totalprice.toFixed(2)


            ordenC.PrecioTotal = Totalprice;
            ordenC.TotalDesc = Totaldesc;

            const actualizarOrden = await ordenRepo.save(ordenC);


            cuponExist.status = true;
            const statusCupon = await cuponRepo.save(cuponExist);
            res.json({ itemEmail })
        } else {
            ordenC.PrecioTotal = totalPrice;
            ordenC.TotalDesc = totalDesc
            const actualizarOrden = await ordenRepo.save(ordenC)
            total = totalPrice.toFixed(2);
            res.json({ ok:true,message:"Se guardo tu reservacion" });
        }

        //try to send email
        try {
            let direccionLocal: string = "6 Avenida Norte 3-11, Sonsonate, Sonsonate";
            let date = new Date();
            const infoCliente = await clienteRepo.findOneOrFail(clienteid.id)
            let subject: string = ` ${infoCliente.nombre + " " + infoCliente.apellido + " Reservacion Exitosa!!!"} `
            console.log(subject);
            console.log(direccionLocal, date, infoCliente);


            let content = itemEmail.reduce((a, b) => {
                return a + '<tr><td>' + b.cantidad + '</td><td>' + b.producto + '</td><td>' + '$' + b.precioOriginal + '</td><td>' + '$' + b.descuento + '</td><td>' + '$' + b.totalNto + '</td></tr>';
            }, '');

            let descTotal = itemEmail.map((a) => a.descuento).reduce((a, b) => a + b)
            console.log(descTotal);


            await transporter.sendMail({
                from: `"System-PC Sonsonate" <castlem791@gmail.com>`, //sender address
                to: infoCliente.email,
                subject: subject,
                html: ` <!DOCTYPE html>
                        <html lang="en">
                        <head> </head>
                        <body><div>
                        <h3>Reservacion Exitosa!!!</h3>
                        <h4>Comprador : </h4>
                <p>Nombre: ${infoCliente.nombre + " " + infoCliente.apellido}</p>
                <p>Email : ${infoCliente.email}</p>
                <p>Dia reservacion : ${date}</p>
                <p>Codigo Orden: ${ordenC.codigoOrden}</p>

                <h4>Vendido Por: </h4>
                <p>Dirección post-compra : </p>
                <p>System-Pc Sonsonate, ${direccionLocal}</p>
                <p>Productos reservados: </p>

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
                <p>Total a Pagar: $${total}</p>
                <a href="${"Link tienda"}">Visitanos pronto !!!</a>
                </div>
                </body>
                </html>`
            });
        } catch (error) {
            return console.log('Algo salio mal al intentar enviar email!!!');
        }
    }

    //estado Orden
    static EstadoOrden = async (req: Request, res: Response) => {
        let ordenDetalle;
        //let orderId;
        const { id } = req.params;
        const OrdenRepo = getRepository(Order);
        const ordenDRepo = getRepository(DetalleOrden)
        const proRepo = getRepository(Producto);
        let itemsOrden: any

        try {
            const order = await OrdenRepo.findOneOrFail({ where: { id } })
            console.log(order);
            let orden = order.id
            if (order.status == 1 || order.status == 2) {
                return res.json({ ok: false, message: 'La orden ya fue completada!!!' });
            } else {
                order.status = 1
                const OrdenComplete = await OrdenRepo.save(order)
                try {
                    ordenDetalle = await ordenDRepo.createQueryBuilder('orden_detalle')
                        .innerJoin('orden_detalle.producto', 'producto')
                        .innerJoin('orden_detalle.orden', 'orden')
                        .addSelect(['producto.nombreProducto', 'producto.id'])
                        .addSelect(['orden.fecha_Orden', 'orden.cliente'])
                        .where({ orden })
                        .getMany()
                    if (ordenDetalle.length > 0) {
                        //recorrer arreglo obtenido desde la base de datos
                        for (let index = 0; index < ordenDetalle.length; index++) {
                            const item = ordenDetalle[index];
                            let producto = item.producto.id
                            //buscarlos productos por id
                            const productoItem = await proRepo.findOneOrFail(producto);
                            //intentar guardar los productos con la cantidad actualizda
                            try {
                                let qtyExits = productoItem.catidad_por_unidad - item.cantidad;
                                productoItem.catidad_por_unidad = qtyExits
                                const producto = await proRepo.save(productoItem)
                                //res.json({message : 'Exito!', producto});
                                console.log(producto);
                            } catch (error) {
                                console.log(error);
                            }
                        }
                    } else {
                        res.json({ message: 'No se encontraron resultados!' })
                    }
                } catch (error) {
                    console.log(error);
                }
                return res.json({ ok: true, OrdenComplete });
            }

        } catch (error) {
            return res.status(404).json({ message: 'No hay registros con este id: ' + id });
        }
    };

    //agregar Orden por cliente local
    static AddOrdenClienteLocal = async (req: Request, res: Response)=>{
        
        const { id } = res.locals.jwtPayload;
        const clienteRepo = getRepository(Cliente);
        const employeeRepo = getRepository(Employee);
        const ordenRepo = getRepository(Order);
        const ordeDRepo = getRepository(DetalleOrden)
        const proRepo = getRepository(Producto);

        let employee : Employee;
        let ClienteLocal : Cliente;
        let ordenC: Order;
        let items: Product[] = req.body;

        let totalPrice: number = 0;
        let totalDesc: number = 0;
        let total: any;

        try {
            employee = await employeeRepo.findOne({id});
            if (employee.email == "") {
                const adminEmail = await employeeRepo.findOne({where:{role: 'admin'}});
                console.log(adminEmail.email);
                employee.email = adminEmail.email;
            }

        } catch (error) {
            console.log('Ocurrio un error!');
        }//buscar employee con el token que recibe
        

        //buscar cliente con el emailLocal
        try {
            ClienteLocal = await clienteRepo.findOne({where:{email : employee.email}});
            if (!ClienteLocal) {
                const Client = new Cliente();
                Client.apellido = "Pc";
                Client.nombre = "System-";
                Client.email = employee.email;
                Client.password = "SystemPc@password";

                //encriptar contraeña
                ClienteLocal.hashPassword();

                const client = await clienteRepo.save(Client);
                console.log(client);
            }
            console.log(ClienteLocal);

            //res.json(ClienteLocal)
                //Guardar Orden
                let date = new Date();
                let month = date.getMonth() + 1;
                const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
                const codigoO = 'SYSTEM_PC-' + codigoOrden + month;

                const or = new Order();
                or.cliente = ClienteLocal,
                or.codigoOrden = codigoO,
                or.status = 1
                ordenC = await ordenRepo.save(or);
                //console.log(ordenC);

                for (let index = 0; index < items.length; index++) {
                    let amount: number = 0;
                    const item = items[index];
                    const productoItem = await proRepo.findOneOrFail(item.id);

                    let operacion = productoItem.costo_standar * item.qt;
                    let Totaldesc = operacion * productoItem.descuento / 100;
                    let totalPay = operacion - Totaldesc
                    let qtyExist = productoItem.catidad_por_unidad - item.qt;

                    amount += totalPay
                    totalPrice += totalPay
                    totalDesc += Totaldesc
                    const OnlyTwoDecimals = amount.toFixed(2);
                    console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);

                    try {
                        //save Orden Detalle
                            const saveOD = new DetalleOrden();
                            saveOD.orden = ordenC,
                            saveOD.producto = productoItem,
                            saveOD.cantidad = item.qt,
                            saveOD.totalUnidad = amount,
                            saveOD.descuento = Totaldesc

                            const Save = await ordeDRepo.save(saveOD);

                            //actualizar producto
                            try {
                                productoItem.catidad_por_unidad = qtyExist;
                                const saveProduct = await proRepo.save(productoItem)
                                
                            } catch (error) {
                                return console.log('Error inesperado!!!');
                            }
                    } catch (error) {
                        console.log(error);
                    }
                }

                ordenC.PrecioTotal = totalPrice;
                ordenC.TotalDesc = totalDesc
                const actualizarOrden = await ordenRepo.save(ordenC)
                res.json({ ok:true,message:"Se guardo la compra!" });

        } catch (error) {
            console.log(error);
        }
        
    }
}

export default OrdenController;