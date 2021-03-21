import { Request, Response } from 'express';
import { Producto } from '../entity/Producto';
import { getRepository, Index } from 'typeorm';
import { Order } from '../entity/Order';
import OrdenDetalle from './OrdenDetalle';
import { DetalleOrden } from '../entity/Detalles_Orden';

interface Product {
    id ?: string,
    qty: number
}

class CarritoController{

    static AgregarProductoCarrito = async (req: Request, res : Response) => {
        try {
            const proRepo = getRepository(Producto)
            req.body.map(async (p : Product, _ : any )=>{
                const {id, qty} = p;
                const productoItem = await proRepo.findOneOrFail(id);
                let amount: number = 0;
                try {
                    let operacion =  productoItem.costo_standar * qty;
                    amount += operacion
                    const OnlyTwoDecimals = amount.toFixed(2);
                    const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ''),10);
                    console.log(OnlyTwoDecimals);
                } catch (error) {
                    console.log(error);
                }
            });
            //all ok
            res.json({message: 'Exito'})
        } catch (error) {
            console.log('Ocurrio un error');
        }
    };
    static guardarOrden_DetalleOrden = async ( req : Request, res : Response) => {
        try {
            const {clienteid} = res.locals.jwtPayload;
            const ordenRepo = getRepository(Order);
            const ordeDRepo = getRepository(DetalleOrden)
            const proRepo = getRepository(Producto)            
            
            const or = new Order();
            or.cliente = clienteid
            const ordenC = await ordenRepo.save(or);
            //console.log(ordenC);
            req.body.map(async(orden : Product, _ : any) => {
                const {id, qty} = orden;
                
                const ordenId = await ordenRepo.findOneOrFail(ordenC.id)
                const productoItem = await proRepo.findOneOrFail(id);
                let amount : number = 0;
                let operacion =  productoItem.costo_standar * qty;
                amount += operacion
                const OnlyTwoDecimals = amount.toFixed(2);
                const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ','),10);

                const saveOD = new DetalleOrden();
                saveOD.orden = ordenId,
                saveOD.producto = productoItem,
                saveOD.cantidad = qty,
                saveOD.totalUnidad = parseAmount
                
                const Save = await ordeDRepo.save(saveOD);
                console.log(Save);
            });
        } catch (error) {
            console.log(error);
        }
        res.json({ok : true});
    }
};
export default CarritoController;