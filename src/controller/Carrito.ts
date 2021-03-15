import { Request, Response } from 'express';
import { Producto } from '../entity/Producto';
import { getRepository, Index } from 'typeorm';

interface Product {
    id ?: string,
    qty: number
}

class CarritoController{

    static AgregarProductoCarrito = async (req: Request, res : Response) => {
        const  [id, qty]  = req.body;
        let productoItem;
        const proRepo = getRepository(Producto)
        let amount = 0;
        let pro : Product[] = req.body;

        //peticion a la base de datos
        
        for (let index = 0; index < pro.length; index++) {
            let item = pro[index]
            try {
                productoItem = await proRepo.findOneOrFail(item.id);
                let operacion =  productoItem.costo_standar * item.qty;
                amount += operacion
                const OnlyTwoDecimals = amount.toFixed(2);
                const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ''),10);
                console.log(parseAmount);
                //return parseAmount;
                //res.json({total: parseAmount})
            }
            catch(err){
                res.json({message:'something goes wrong!'})
            }
            //console.log(pro[index].id);
            console.log(productoItem);
            //all ok
            
        }
    };
}
export default CarritoController;