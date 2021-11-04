"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Order_1 = require("../entity/Order");
const Producto_1 = require("../entity/Producto");
const Detalles_Orden_1 = require("../entity/Detalles_Orden");
const Cliente_1 = require("../entity/Cliente");
const mailer_1 = require("../middleware/mailer");
const Cupones_1 = require("../entity/Cupones");
const Employee_1 = require("../entity/Employee");
class OrdenController {
}
//mostrar ordens
OrdenController.MostrarOrdenes = async (req, res) => {
    try {
        const ordenRepo = typeorm_1.getRepository(Order_1.Order);
        const orders = await ordenRepo.find();
        return res.json({ ok: true, orders });
    }
    catch (_a) {
        return res.send({ ok: false, message: "error en el servidor" });
    }
};
//mostrar ordenes Paginadas
OrdenController.MostrarOrdenPaginadas = async (req, res) => {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    let searchOrden = req.query.searchOrden || "";
    take = Number(take);
    try {
        const ordenesRepo = typeorm_1.getRepository(Order_1.Order);
        const [ordenes, totalItems] = await ordenesRepo
            .createQueryBuilder("orden")
            .innerJoin("orden.cliente", "cliente")
            .addSelect([
            "cliente.nombre",
            "cliente.apellido",
            "cliente.direccion",
        ])
            .skip((pagina - 1) * take)
            .take(take)
            .where("orden.codigoOrden like :codeOrden", {
            codeOrden: `%${searchOrden}%`,
        })
            .orderBy("orden.id", "DESC")
            .getManyAndCount();
        if (ordenes.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                ordenes,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados!",
            });
        }
    }
    catch (error) {
        res.json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//mostrar ordenes por clientes
OrdenController.MostrarOrdenCliente = async (req, res) => {
    const { clienteid } = res.locals.jwtPayload;
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const ordenesRepo = typeorm_1.getRepository(Order_1.Order);
        const [ordenes, totalItems] = await ordenesRepo
            .createQueryBuilder("orden")
            .innerJoin("orden.cliente", "cliente")
            .addSelect([
            "cliente.nombre",
            "cliente.apellido",
            "cliente.direccion",
        ])
            .where("orden.clienteId = :id", { id: clienteid })
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        if (ordenes.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            return res.json({
                ok: true,
                ordenes,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            return res.json({
                ok: false,
                message: "No se encontraron resultados!",
            });
        }
    }
    catch (error) {
        return res.json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//agregar Reservacion
OrdenController.AddReservacion = async (req, res) => {
    const { clienteid } = res.locals.jwtPayload;
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    let CODIGO_CUPON = req.query.CODIGO_CUPON;
    let cuponExist;
    let ordenC;
    let SaveDtO;
    let items = req.body;
    let totalPrice = 0;
    let totalDesc = 0;
    let BeneficioTotal = 0;
    let total;
    let descuentoCupon = 0.0;
    let ParseTotal;
    ////declaraciones de IVA
    let PorcentajeTotal = 1.0;
    let PorcentajeIVA = 0.13;
    let TotalIva = PorcentajeTotal + PorcentajeIVA;
    const itemEmail = [];
    try {
        //verificar CODE_CUPON
        if (CODIGO_CUPON) {
            try {
                cuponExist = await cuponRepo.findOneOrFail({
                    where: { codigo: CODIGO_CUPON },
                });
                if (cuponExist.status == true) {
                    return res
                        .status(400)
                        .json({
                        message: "El cupón con el codigo: " +
                            CODIGO_CUPON +
                            " , ya ha sido utilizado!!!",
                    });
                }
                else {
                    let date = new Date();
                    let month = date.getMonth() + 1;
                    const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
                    const codigoO = "M&E-" + codigoOrden + month;
                    const or = new Order_1.Order();
                    or.cliente = clienteid;
                    or.codigoOrden = codigoO;
                    or.status = 0;
                    ordenC = await ordenRepo.save(or);
                    for (let index = 0; index < items.length; index++) {
                        let amount = 0;
                        let totalIVA = 0.0;
                        const item = items[index];
                        const productoItem = await proRepo.findOneOrFail(item.id);
                        //dividir el descuento del cupon entre los items que vienen del request
                        let descuentoProducto = cuponExist.descuento / items.length;
                        let descProducto = parseFloat(descuentoProducto.toFixed(2));
                        try {
                            let operacion = productoItem.costo_standar * item.qt;
                            //CalculoNeto
                            let neto = operacion / TotalIva;
                            let Neto = neto.toFixed(2);
                            let totaldesc = (operacion * descProducto) / 100;
                            let Totaldesc = parseFloat(totaldesc.toFixed(2));
                            let totalPay = operacion - Totaldesc;
                            let qtyExist = productoItem.catidad_por_unidad - item.qt;
                            amount += totalPay;
                            totalPrice += totalPay;
                            totalDesc += Totaldesc;
                            const OnlyTwoDecimals = amount.toFixed(2);
                            let itemString = item.qt.toString();
                            //declaraciones de IVA
                            let precioSinIVA = amount / TotalIva;
                            let newPreciosSinIVA = parseFloat(precioSinIVA.toFixed(2));
                            totalIVA += newPreciosSinIVA;
                            let totIVA = amount - newPreciosSinIVA;
                            let TotIVA = parseFloat(totIVA.toFixed(2));
                            let beneficioLocal = totalPay -
                                productoItem.precioCompra * item.qt;
                            let beneficioSinIVA = beneficioLocal / TotalIva;
                            let BeneficioLocal = parseFloat(beneficioSinIVA.toFixed(2));
                            BeneficioTotal += BeneficioLocal;
                            try {
                                //save Orden Detalle
                                let totalDesto = parseFloat(Totaldesc.toFixed(2));
                                const saveOD = new Detalles_Orden_1.DetalleOrden();
                                (saveOD.orden = ordenC),
                                    (saveOD.producto = productoItem),
                                    (saveOD.cantidad = item.qt),
                                    (saveOD.totalUnidad = newPreciosSinIVA),
                                    (saveOD.impuesto = TotIVA),
                                    (saveOD.descuento = totalDesto),
                                    (saveOD.beneficioLocal =
                                        BeneficioLocal);
                                SaveDtO = await ordeDRepo.save(saveOD);
                            }
                            catch (error) {
                                return res
                                    .status(401)
                                    .json({
                                    ok: false,
                                    message: "Algo salio mal!",
                                });
                            }
                            let totalProducto = SaveDtO.totalUnidad + SaveDtO.impuesto;
                            ParseTotal = parseFloat(totalProducto.toFixed(2));
                            let itm = {
                                codigoOrden: ordenC.codigoOrden,
                                cantidad: itemString,
                                producto: productoItem.nombreProducto,
                                precioOriginal: productoItem.costo_standar,
                                descuento: descProducto,
                                totalNto: Neto,
                                IVA: TotIVA,
                                totalProducto: ParseTotal,
                            };
                            itemEmail.push(itm);
                            //actualizar producto
                            try {
                                productoItem.catidad_por_unidad = qtyExist;
                                const saveProduct = await proRepo.save(productoItem);
                            }
                            catch (error) {
                                return res
                                    .status(400)
                                    .json({
                                    ok: false,
                                    message: "Algo salio mal!",
                                });
                            }
                        }
                        catch (error) {
                            return res
                                .status(400)
                                .json({
                                ok: false,
                                message: "Algo ha fallado!",
                                error,
                            });
                        }
                    }
                }
                //Guardar Orden
            }
            catch (error) {
                return res
                    .status(400)
                    .json({
                    ok: false,
                    message: "El cupón con el codigo: " +
                        CODIGO_CUPON +
                        " no es valido!!!",
                });
            }
        }
        else {
            //Guardar Orden
            let date = new Date();
            let month = date.getMonth() + 1;
            const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
            const codigoO = "M&E-" + codigoOrden + month;
            const or = new Order_1.Order();
            or.cliente = clienteid;
            or.codigoOrden = codigoO;
            or.status = 0;
            ordenC = await ordenRepo.save(or);
            for (let index = 0; index < items.length; index++) {
                let amount = 0;
                let totalIVA = 0.0;
                const item = items[index];
                const productoItem = await proRepo.findOneOrFail(item.id);
                let operacion = productoItem.costo_standar * item.qt;
                //CalculoNeto
                let neto = operacion / TotalIva;
                let Neto = neto.toFixed(2);
                let totaldesc = (operacion * productoItem.descuento) / 100;
                let Totaldesc = parseFloat(totaldesc.toFixed(2));
                let totalPay = operacion - Totaldesc;
                let qtyExist = productoItem.catidad_por_unidad - item.qt;
                amount += totalPay;
                totalPrice += totalPay;
                totalDesc += Totaldesc;
                const OnlyTwoDecimals = amount.toFixed(2);
                let itemString = item.qt.toString();
                let precioSinIVA = amount / TotalIva;
                let newPreciosSinIVA = parseFloat(precioSinIVA.toFixed(2));
                totalIVA += newPreciosSinIVA;
                let totIVA = amount - newPreciosSinIVA;
                let TotIVA = parseFloat(totIVA.toFixed(2));
                let beneficioLocal = totalPay - productoItem.precioCompra * item.qt;
                let beneficioSinIVA = beneficioLocal / TotalIva;
                let BeneficioLocal = parseFloat(beneficioSinIVA.toFixed(2));
                BeneficioTotal += BeneficioLocal;
                try {
                    //save Orden Detalle
                    let totalDesto = parseFloat(Totaldesc.toFixed(2));
                    const saveOD = new Detalles_Orden_1.DetalleOrden();
                    (saveOD.orden = ordenC),
                        (saveOD.producto = productoItem),
                        (saveOD.cantidad = item.qt),
                        (saveOD.totalUnidad = newPreciosSinIVA),
                        (saveOD.impuesto = TotIVA),
                        (saveOD.descuento = totalDesto),
                        (saveOD.beneficioLocal = BeneficioLocal);
                    SaveDtO = await ordeDRepo.save(saveOD);
                }
                catch (error) {
                    return res
                        .status(400)
                        .json({ ok: false, message: "Algo ha fallado!" });
                }
                let totalProducto = SaveDtO.totalUnidad + SaveDtO.impuesto;
                ParseTotal = parseFloat(totalProducto.toFixed(2));
                let itm = {
                    codigoOrden: ordenC.codigoOrden,
                    cantidad: itemString,
                    producto: productoItem.nombreProducto,
                    precioOriginal: productoItem.costo_standar,
                    descuento: productoItem.descuento,
                    totalNto: Neto,
                    IVA: TotIVA,
                    totalProducto: ParseTotal,
                };
                itemEmail.push(itm);
                //actualizar producto
                try {
                    productoItem.catidad_por_unidad = qtyExist;
                    const saveProduct = await proRepo.save(productoItem);
                }
                catch (error) {
                    return res
                        .status(400)
                        .json({ ok: false, message: "Algo salio mal!" });
                }
            }
        }
    }
    catch (error) {
        return res
            .status(403)
            .json({ ok: false, message: "Algo salio mal!", error });
    }
    if (cuponExist) {
        ordenC.PrecioTotal = totalPrice;
        ordenC.TotalDesc = totalDesc;
        ordenC.BeneficioVenta = BeneficioTotal;
        const actualizarOrden = await ordenRepo.save(ordenC);
        total = totalPrice.toFixed(2);
        cuponExist.status = true;
        const statusCupon = await cuponRepo.save(cuponExist);
        res.json({ ok: true, message: "Se guardo tu reservacion" });
    }
    else {
        ordenC.PrecioTotal = totalPrice;
        ordenC.TotalDesc = totalDesc;
        ordenC.BeneficioVenta = BeneficioTotal;
        const actualizarOrden = await ordenRepo.save(ordenC);
        total = totalPrice.toFixed(2);
        res.json({ ok: true, message: "Se guardo tu reservacion" });
    }
    //try to send email
    try {
        let direccionLocal = "6 Avenida Norte 3-11, Sonsonate, Sonsonate";
        let date = new Date();
        const infoCliente = await clienteRepo.findOneOrFail(clienteid);
        let subject = ` ${infoCliente.nombre +
            " " +
            infoCliente.apellido +
            " Reservacion Exitosa!!!"} `;
        let content = itemEmail.reduce((a, b) => {
            return (a +
                "<tr><td>" +
                b.producto +
                "</td><td>" +
                b.cantidad +
                "</td><td>" +
                "$" +
                b.precioOriginal +
                "</td><td>" +
                b.descuento +
                "%" +
                "</td><td>" +
                "$" +
                b.IVA +
                "</td><td>" +
                "$" +
                b.totalNto +
                "</td><td>" +
                "$" +
                b.totalProducto +
                "</td></tr>");
        }, "");
        let descTotal = itemEmail
            .map((a) => a.descuento)
            .reduce((a, b) => a + b, 0);
        let TotalIVA = itemEmail
            .map((a) => a.IVA)
            .reduce((a, b) => a + b, 0);
        let email = process.env.CORREO;
        await mailer_1.transporter.sendMail({
            from: `"M&E Soporte Tecnico Sonsonate" <${email}>`,
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
                <p>M&E Soporte Tecnico Sonsonate, ${direccionLocal}</p>
                <p>Productos reservados: </p>

                <table style = "border: hidden" >
                    <thead class="tablahead" style="font-family: -apple-system">
                    <tr>
                    <th id="Descripcion">Descripcion</th>
                    <th id="UDS">Uds</th>
                    <th id="Precio">Precio</th>
                    <th id="desc">DescProducto</th>
                    <th id="Iva">IVA 13%</th>
                    <th id="TotalNto">TotalNto</th>
                    <th id="Total">Total</th>
                    </tr>
                </thead>
                <tbody id="bodytabla">

                ${content}

                </tbody>
                </table>
                <p>Descuento Total : $${totalDesc}</p>

                <p>IVA: $${parseFloat(TotalIVA.toFixed(2))}</p>
                <p>Total a Pagar: $${total}</p>
                <a href="https://client-mye-soporte.vercel.app">Visitanos pronto !</a>
                </div>
                </body>
                </html>`,
        });
    }
    catch (error) {
        return console.log({
            ok: false,
            message: "Algo ha fallado en el servidor!",
            error,
        });
    }
};
//estado Orden
OrdenController.EstadoOrden = async (req, res) => {
    let ordenDetalle;
    //let orderId;
    const { id } = req.params;
    const OrdenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordenDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let itemsOrden;
    try {
        const order = await OrdenRepo.findOneOrFail({ where: { id } });
        let orden = order.id;
        if (order.status == 1 || order.status == 2) {
            return res.json({
                ok: false,
                message: "La orden ya fue completada!!!",
            });
        }
        else {
            order.status = 1;
            const OrdenComplete = await OrdenRepo.save(order);
            try {
                ordenDetalle = await ordenDRepo
                    .createQueryBuilder("orden_detalle")
                    .innerJoin("orden_detalle.producto", "producto")
                    .innerJoin("orden_detalle.orden", "orden")
                    .addSelect(["producto.nombreProducto", "producto.id"])
                    .addSelect(["orden.fecha_Orden", "orden.cliente"])
                    .where({ orden })
                    .getMany();
                if (ordenDetalle.length > 0) {
                    //recorrer arreglo obtenido desde la base de datos
                    for (let index = 0; index < ordenDetalle.length; index++) {
                        const item = ordenDetalle[index];
                        let producto = item.producto.id;
                        //buscarlos productos por id
                        const productoItem = await proRepo.findOneOrFail(producto);
                        //intentar guardar los productos con la cantidad actualizda
                        try {
                            let qtyExits = productoItem.catidad_por_unidad -
                                item.cantidad;
                            productoItem.catidad_por_unidad = qtyExits;
                            const producto = await proRepo.save(productoItem);
                            //res.json({message : 'Exito!', producto});
                        }
                        catch (error) {
                            return res
                                .status(400)
                                .json({
                                ok: false,
                                message: "Algo ha fallado!",
                            });
                        }
                    }
                }
                else {
                    res.json({
                        ok: false,
                        message: "No se encontraron resultados!",
                    });
                }
            }
            catch (error) {
                return res
                    .status(400)
                    .json({ ok: false, message: "Algo salio mal!" });
            }
            res.json({ ok: true, message: " La orden se completo!" });
        }
    }
    catch (error) {
        return res
            .status(404)
            .json({
            ok: false,
            message: "No hay registros con este id: " + id,
        });
    }
};
//agregar Orden por cliente local
OrdenController.AddOrdenClienteLocal = async (req, res) => {
    const { id } = res.locals.jwtPayload;
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    const employeeRepo = typeorm_1.getRepository(Employee_1.Employee);
    const ordenRepo = typeorm_1.getRepository(Order_1.Order);
    const ordeDRepo = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const proRepo = typeorm_1.getRepository(Producto_1.Producto);
    let employee;
    let ClienteLocal;
    let ordenC;
    let items = req.body;
    let totalPrice = 0;
    let totalDesc = 0;
    let BeneficioTotal = 0;
    let total;
    ////declaraciones de IVA
    let PorcentajeTotal = 1.0;
    let PorcentajeIVA = 0.13;
    let TotalIva = PorcentajeTotal + PorcentajeIVA;
    try {
        employee = await employeeRepo.findOne({ id });
        if (employee.email == "") {
            const adminEmail = await employeeRepo.findOne({
                where: { role: "admin" },
            });
            console.log(adminEmail.email);
            employee.email = adminEmail.email;
        }
    }
    catch (error) {
        return res
            .status(401)
            .json({ ok: false, message: "Algo ha fallado!" });
    }
    //buscar employee con el token que recibe
    //buscar cliente con el emailLocal
    try {
        ClienteLocal = await clienteRepo.findOne({
            where: { email: employee.email },
        });
        if (!ClienteLocal) {
            const Client = new Cliente_1.Cliente();
            Client.apellido = "Pc";
            Client.nombre = "System-";
            Client.email = employee.email;
            Client.password = "SystemPc@password";
            //encriptar contraeña
            Client.hashPassword();
            const client = await clienteRepo.save(Client);
            ClienteLocal = client;
        }
        //Guardar Orden
        let date = new Date();
        let month = date.getMonth() + 1;
        const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
        const codigoO = "M&E-" + codigoOrden + month;
        const or = new Order_1.Order();
        (or.cliente = ClienteLocal),
            (or.codigoOrden = codigoO),
            (or.status = 1);
        ordenC = await ordenRepo.save(or);
        //console.log(ordenC);
        for (let index = 0; index < items.length; index++) {
            let amount = 0;
            let totalIVA = 0.0;
            const item = items[index];
            const productoItem = await proRepo.findOneOrFail(item.id);
            let operacion = productoItem.costo_standar * item.qt;
            let totaldesc = (operacion * productoItem.descuento) / 100;
            let Totaldesc = parseFloat(totaldesc.toFixed(2));
            let totalPay = operacion - Totaldesc;
            let qtyExist = productoItem.catidad_por_unidad - item.qt;
            amount += totalPay;
            totalPrice += totalPay;
            totalDesc += Totaldesc;
            const OnlyTwoDecimals = amount.toFixed(2);
            let precioSinIVA = amount / TotalIva;
            let newPreciosSinIVA = parseFloat(precioSinIVA.toFixed(2));
            totalIVA += newPreciosSinIVA;
            let totIVA = amount - newPreciosSinIVA;
            let TotIVA = parseFloat(totIVA.toFixed(2));
            //calcular beneficios para el local
            let beneficioLocal = totalPay - productoItem.precioCompra * item.qt;
            let beneficioSinIVA = beneficioLocal / TotalIva;
            let BeneficioLocal = parseFloat(beneficioSinIVA.toFixed(2));
            BeneficioTotal += BeneficioLocal;
            try {
                //save Orden Detalle
                let totalDesto = parseFloat(Totaldesc.toFixed(2));
                const saveOD = new Detalles_Orden_1.DetalleOrden();
                (saveOD.orden = ordenC),
                    (saveOD.producto = productoItem),
                    (saveOD.cantidad = item.qt),
                    (saveOD.totalUnidad = newPreciosSinIVA),
                    (saveOD.impuesto = TotIVA),
                    (saveOD.descuento = totalDesto);
                saveOD.beneficioLocal = BeneficioLocal;
                const Save = await ordeDRepo.save(saveOD);
                //actualizar producto
                try {
                    productoItem.catidad_por_unidad = qtyExist;
                    const saveProduct = await proRepo.save(productoItem);
                }
                catch (error) {
                    return console.log("Error inesperado!!!");
                }
            }
            catch (error) {
                return res
                    .status(400)
                    .json({ ok: false, message: "Algo salio mal!" });
            }
        }
        (ordenC.PrecioTotal = totalPrice),
            (ordenC.TotalDesc = totalDesc),
            (ordenC.BeneficioVenta = BeneficioTotal);
        const actualizarOrden = await ordenRepo.save(ordenC);
        res.json({ ok: true, message: "Se guardo la compra!" });
    }
    catch (error) {
        return res
            .status(404)
            .json({ ok: false, message: "Algo ha fallado!" });
    }
};
//Metodo para Cancelar una reservacion
OrdenController.CancelReservation = async (req, res) => {
    const { codigoOrden } = req.body;
    const OrdenRepo = typeorm_1.getRepository(Order_1.Order);
    const dtoOrden = typeorm_1.getRepository(Detalles_Orden_1.DetalleOrden);
    const Productos = typeorm_1.getRepository(Producto_1.Producto);
    let order;
    let DetoOrdenes;
    let productUpdated;
    //Encontrar la orden a ejecutar
    try {
        order = await OrdenRepo.findOneOrFail({
            where: { codigoOrden: codigoOrden },
        });
        //res.json(orden)
    }
    catch (error) {
        return res.json({
            ok: false,
            message: `Orden con el codigo: ${codigoOrden} no se ha encontrado`,
        });
    }
    //intentar encontar detalles de Orden
    try {
        if (order.status == 0) {
            let orden = order.id;
            //DetoOrdenes = await dtoOrden.find({where: {orden : orden.id}})
            DetoOrdenes = await dtoOrden
                .createQueryBuilder("detalle_orden")
                .innerJoin("detalle_orden.producto", "prod")
                .innerJoin("detalle_orden.orden", "order")
                .addSelect(["prod.id"])
                .addSelect(["order.id"])
                .where({ orden })
                .getMany();
            //console.log(DetoOrdenes);
        }
        else {
            return res.json({
                ok: false,
                message: `Orden con el codigo: ${order.codigoOrden} ya ha sido completada!`,
            });
        }
    }
    catch (error) {
        return res.json({ ok: false, message: "Algo ha salido mal!" });
    }
    //recorrer objeto para encontrar los productos
    try {
        //let dtsOrdenes : DetalleOrden[];
        const dtsOrdenes = DetoOrdenes.map(async (pro) => {
            let productID = pro.producto.id;
            const Product = await Productos.findOne({
                where: { id: productID },
            });
            //console.log(Product);
            if (Product.status == false) {
                let returnProductStock = pro.cantidad + Product.catidad_por_unidad;
                Product.catidad_por_unidad = returnProductStock;
                Product.status = true;
                const prod = await Productos.save(Product);
                //console.log(returnProductStock);
            }
            else {
                let returnProductStock = pro.cantidad + Product.catidad_por_unidad;
                Product.catidad_por_unidad = returnProductStock;
                Product.status = true;
                const prod = await Productos.save(Product);
            }
        });
        //actualizar Orden
        order.status = 2;
        const OrdenCanceled = OrdenRepo.save(order);
        res.json({ message: "Orden Cancelada!" });
    }
    catch (error) {
        return;
    }
};
exports.default = OrdenController;
//# sourceMappingURL=Orden.js.map