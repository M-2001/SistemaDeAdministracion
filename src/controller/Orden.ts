import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Order } from '../entity/Order';
import { Producto } from '../entity/Producto';
import { DetalleOrden } from '../entity/Detalles_Orden';


interface Product {
    id ?: string,
    qty: number
}

class OrdenController {

    static MostrarOrdenPaginadas = async ( req : Request, res : Response ) => {
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const ordenesRepo = getRepository(Order);
            const [ordenes, totalItems] = await ordenesRepo.createQueryBuilder('orden')
            .innerJoin('orden.cliente', 'cliente')
            .addSelect(['cliente.nombre', 'cliente.apellido', 'cliente.direccion'])
            .skip((pagina - 1 ) * take)
            .take(take)
            .getManyAndCount()

            if (ordenes.length > 0) {
                let totalPages : number = totalItems / take;
                if(totalPages % 1 == 0 ){
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage : number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage : number = pagina <= 1 ? pagina : pagina -1
                res.json({ok: true, ordenes, totalItems, totalPages, currentPage : pagina, nextPage, prevPage})
            } else {
                res.json({message : 'No se encontraron resultados!'})
            }
        } catch (error) {
            res.json({message : 'Algo ha salido mal!'})
        }
    }

    static AddReservacion = async(req : Request, res : Response) => {
        const {clienteid} = res.locals.jwtPayload;
        const ordenRepo = getRepository(Order);
        const ordeDRepo = getRepository(DetalleOrden)
        const proRepo = getRepository(Producto);
        let items : Product[] = req.body;
        
        let totalPrice : number = 0;
        let totalDesc : number = 0;
        
        try {
            const or = new Order();
            or.cliente = clienteid;
            or.status = 0
            const ordenC = await ordenRepo.save(or);

            for (let index = 0; index < items.length; index++) {
                let amount: number = 0;
                const item = items[index];
                const productoItem = await proRepo.findOneOrFail(item.id);

                let operacion = productoItem.costo_standar * item.qty;
                let Totaldesc = operacion * productoItem.descuento
                let totalPay =  operacion - Totaldesc
                //let qtyExist = productoItem.catidad_por_unidad - item.qty;

                    amount += totalPay
                    totalPrice += totalPay
                    totalDesc += Totaldesc
                    const OnlyTwoDecimals = amount.toFixed(2);
                    const parseAmount = parseInt(OnlyTwoDecimals.replace('.', '.'),10);
                    console.log(OnlyTwoDecimals, productoItem.nombreProducto, Totaldesc);

                    try {
                        //save Orden Detalle
                    const saveOD = new DetalleOrden();
                    saveOD.orden = ordenC,
                    saveOD.producto = productoItem,
                    saveOD.cantidad = item.qty,
                    saveOD.totalUnidad = amount,
                    saveOD.descuento = Totaldesc

                    const Save = await ordeDRepo.save(saveOD);
                    } catch (error) {
                        console.log(error);
                    }
            }

            ordenC.PrecioTotal = totalPrice;
            ordenC.TotalDesc = totalDesc 
            const actualizarOrden = await ordenRepo.save(ordenC)
            res.json({ok: true, message:'Reservacion realizada con exito!!!'});

        } catch (error) {
            console.log(error);
        }
        let total = totalPrice.toFixed(2);
    }

    //estado Orden
    static EstadoOrden = async ( req : Request, res : Response) => {
        let ordenDetalle;
        //let orderId;
        const {id} = req.params;
        const OrdenRepo = getRepository(Order);
        const ordenDRepo = getRepository(DetalleOrden)
        const proRepo = getRepository(Producto);
        let itemsOrden : any
        
        try {
            const order = await OrdenRepo.findOneOrFail({where : {id}})
            console.log(order);
            let orden = order.id
            if(order.status == 1 || order.status == 2){
                return res.json({ok: false, message: 'La orden ya fue completada!!!'});
            }else{
                order.status = 1
                const OrdenComplete = await OrdenRepo.save(order)
                try {
                    ordenDetalle = await ordenDRepo.createQueryBuilder('orden_detalle')
                    .innerJoin('orden_detalle.producto', 'producto')
                    .innerJoin('orden_detalle.orden', 'orden')
                    .addSelect(['producto.nombreProducto', 'producto.id'])
                    .addSelect(['orden.fecha_Orden','orden.cliente'])
                    .where({orden})
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
                        res.json({message : 'No se encontraron resultados!'})
                    }
                } catch (error) {
                    console.log(error);
                }
                return res.json({ok : true, OrdenComplete});
            }

        } catch (error) {
            return res.status(404).json({message:'No hay registros con este id: ' + id });
        }
    };
}

export default OrdenController;