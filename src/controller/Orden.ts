import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Order } from '../entity/Order';
import { Producto } from '../entity/Producto';
import ProductoController from './Producto';

const product = ProductoController;

class OrdenController {

    

    static AgregarOrden = async (req: Request, res : Response)=>{
        const { clienteid } = res.locals.jwtPayload;
        const productos = req.body;
        const ordenRepo = getRepository(Order); 
        const orden = new Order()
        orden.cliente = clienteid;
        orden.producto = productos;
        try {
            console.log(clienteid);
            const newOrder = await ordenRepo.save(orden);
        } catch (error) {
            res.status(400).json({message : 'Algo ha salio mal!'});
        }
        //all ok 
        res.json({message : 'Orden agregada!'});
    };


    static AgregarProductoCarrito = async (req: Request, res : Response /*productos : Producto[]*/) => {

        const {id, catidad_por_unidad} = req.body;
        let amount = 0;

        // for (let i = 0; i < productos.length; i++ ) {
        //     const producto = productos[i];

            //peticion a la base de datos
        try {
            const productoItem = await product.getProductoById(id);
            let operacion =  productoItem.costo_standar * catidad_por_unidad;
            amount += operacion
        } catch (error) {
            res.json({message:'something goes wrong!'})
        }
        //all ok
        const OnlyTwoDecimals = amount.toFixed(2);
        const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ''),10);
        res.json({total: parseAmount})
        }
        // return parseAmount;
    //};
}

export default OrdenController;