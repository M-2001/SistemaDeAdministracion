import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Cupon } from '../entity/Cupones';


class CuponController{
    //crear cupon de descuento
    static CrearCupon = async( req : Request, res : Response) => {
        let newCupon;
        try {

            const cuponRepo = getRepository(Cupon);
            let date = new Date();
            let month = date.getMonth() + 1;
            const codigoCupon = Math.floor(Math.random()* 90000) + 10000;
            const codigo = 'SYSTEM_PC-'+ codigoCupon + month;
    
            const {descuento} = req.body;
    
            const cupon = new Cupon();
            cupon.codigo = codigo,
            cupon.descuento = descuento,

            newCupon = await cuponRepo.save(cupon);
            //all is ok
            res.json({ok: true, message : 'Cupon Creado con exito', newCupon});
            console.log(newCupon);

        } catch (error) {
            console.log(error);
        }
    }

    static EstadoCupon = async ( req : Request, res : Response) => {
        let cupon;
        const id = req.body;
        const cuponRepo = getRepository(Cupon);
        try {
            cupon = await cuponRepo.findOneOrFail(id)

            if(cupon.status == true){
                cupon.status = false
            }else{
                cupon.status = true
            }
            
            const cuponStatus = await cuponRepo.save(cupon)
            res.json({ok : true, cupon : cuponStatus.status })
        
        } catch (error) {
            console.log(error);
        }
    };

    static MostrarCupones = async ( req : Request, res : Response) => {
        let cupon;
        const cuponRepo = getRepository(Cupon);
        try {
            cupon = await cuponRepo.findAndCount()

            if (cupon.length > 0){
                res.json({ok : true, cupon })
            }
            else{
                res.json({message: ' No se encontraron resultados'})
            }
        } catch (error) {
            console.log(error);
        }
    }

    //mostrar cupones Pajinados
    static MostrarCuponesPaginados = async ( req : Request, res : Response ) => {
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const cuponRepo = getRepository(Cupon);
            const [cupones, totalItems] = await cuponRepo.findAndCount({take, skip : (pagina -1) * take});
            if (cupones.length > 0) {
                let totalPages : number = totalItems / take;
                if(totalPages % 1 == 0 ){
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage : number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage : number = pagina <= 1 ? pagina : pagina -1
                res.json({ok: true, cupones, totalItems, totalPages, currentPage : pagina, nextPage, prevPage})
            } else {
                res.json({message : 'No se encontraron resultados!'})
            }
        } catch (error) {
            res.json({message : 'Algo ha salido mal!'})
        }
    }
    //eliminar Cupon
    static EliminarCupon = async ( req : Request, res : Response) =>{
        let cupon;
        const {id} = req.body;
        const cuponRepo = getRepository(Cupon);
        try {
            cupon = await cuponRepo.findOneOrFail({where:{id}});
        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados '})
        }
        //Try to delete Category
        try {
            await cuponRepo.remove(cupon)
        } catch (error) {
            return res.status(409).json({message:'Algo ha salido mal!'});
        }
        res.json({messge:'Cupon ha sido eliminado!'});
    };

}
export default CuponController;