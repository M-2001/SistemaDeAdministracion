import { Request, Response } from 'express';
import { Producto } from '../entity/Producto';
import { getRepository, Index } from 'typeorm';
import { Order } from '../entity/Order';
import OrdenDetalle from './OrdenDetalle';
import { DetalleOrden } from '../entity/Detalles_Orden';

interface Product {
    id: number,
    qty: number
}

let Items : any
class CarritoController{
    static AgregarProductoCarrito = async (req: Request, res : Response) => {

        let items : Product[] = req.body;
        Items = items
        const proRepo =  getRepository(Producto)
        let totalPrice : number = 0

        try {
            for (let index = 0; index < items.length; index++) {
                let amount: number = 0;
                const item = items[index];
                const productoItem = await proRepo.findOneOrFail(item.id);
                
                let operacion =  productoItem.costo_standar * item.qty;
                let Totaldesc = operacion * productoItem.descuento
                let totalPay =  operacion - Totaldesc
                    amount += totalPay
                    totalPrice += totalPay
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
            
        } catch (error) {
            console.log('Ocurrio un error');
        }
        //all ok
        let total = totalPrice.toFixed(2)
        res.json({total, Items})
    };
    static guardarOrden_DetalleOrden = async ( req : Request, res : Response) => {
            const {clienteid} = res.locals.jwtPayload;
            const ordenRepo = getRepository(Order);
            const ordeDRepo = getRepository(DetalleOrden)
            const proRepo = getRepository(Producto);
            let totalToPay : number = 0;
        try {            
            
            const or = new Order();
            or.cliente = clienteid
            const ordenC = await ordenRepo.save(or);
            //console.log(ordenC);
            req.body.map(async(orden : Product, _ : any) => {
                const {id, qty} = orden;
                
                //const ordenId = await ordenRepo.findOneOrFail(ordenC.id)
                //console.log(ordenId.id);
                const productoItem = await proRepo.findOneOrFail(id);
                //console.log(productoItem.catidad_por_unidad);
                
                    let amount : number = 0;
                    let operacion =  productoItem.costo_standar * qty;
                    let qtyExist = productoItem.catidad_por_unidad - qty;
                    amount += operacion
                    const OnlyTwoDecimals = amount.toFixed(2);
                    const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ','),10);
    
                    const saveOD = new DetalleOrden();
                    saveOD.orden = ordenC,
                    saveOD.producto = productoItem,
                    saveOD.cantidad = qty,
                    saveOD.totalUnidad = parseAmount
                    
                    const Save = await ordeDRepo.save(saveOD);
    
                    productoItem.catidad_por_unidad = qtyExist;
                    
                    const saveProduct = await proRepo.save(productoItem)
    
                    console.log(saveProduct);
                
                    // totalToPay += operacion
                    // console.log(totalToPay);
            });

            
        } catch (error) {
            console.log(error);
        }
        res.json({ok : true, totalToPay});
    }
};
export default CarritoController;