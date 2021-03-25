import { Request, Response } from 'express';
import { Producto } from '../entity/Producto';
import { getRepository, Index } from 'typeorm';

interface Product {
    id: number,
    qty: number
}

class CarritoController {

    static AgregarProductoCarrito = async (req: Request, res: Response) => {
        try {
            const proRepo = getRepository(Producto)
            req.body.map(async (p: Product, _) => {
                const { id, qty } = p
                const productoItem = await proRepo.findOneOrFail(id);
                let amount: number = 0
                try {
                    let operacion = productoItem.costo_standar * qty;
                    amount += operacion
                    const OnlyTwoDecimals = amount.toFixed(2);
                    const parseAmount = parseInt(OnlyTwoDecimals.replace('.', ''), 10);
                    console.log(OnlyTwoDecimals);
                } catch (error) {
                    console.log(error)
                }
                console.log(productoItem)
            })
            res.json({ message: "Exito" })
        } catch {
            res.json({ message: "Ocurrio un error" })
        }

    };
}
export default CarritoController;