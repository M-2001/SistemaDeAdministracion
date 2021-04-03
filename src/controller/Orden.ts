import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Order } from '../entity/Order';
import { Producto } from '../entity/Producto';
import ProductoController from './Producto';

const product = ProductoController;

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
}

export default OrdenController;