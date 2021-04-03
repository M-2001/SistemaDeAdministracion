import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Rating } from '../entity/Rating';
class RatingController {

    //Agregar rating a producto
    static AgregarRating = async (req : Request, res : Response) =>{
        const {clienteid} = res.locals.jwtPayload;
        const {productoId, ratingNumber, titulo, comentario} = req.body;
        const ratingRepo = getRepository(Rating)

        const rating = new Rating();
        
        rating.ratingNumber = ratingNumber;
        rating.titulo = titulo;
        rating.comentario = comentario;
        rating.producto = productoId;
        rating.cliente = clienteid;


        //try so save rating
        try {
            await ratingRepo.save(rating)
        } catch (error) {
            res.status(409).json({message: 'something goes wrong'});
        }
        //all is ok
        res.json({message : 'Rating agregado con exito', rating});
    };

    //mostrar rating paginados
    static MostrarRating = async ( req : Request, res : Response) => {
        let pagina = req.query.pagina || 0;
        pagina = Number(pagina);
        let take = req.query.limit || 10;
        take = Number(take)
        try {
            const ratingRepo = getRepository(Rating)
            const rating = await ratingRepo.query(` select r.id, r.ratingNumber, r.titulo, r.comentario, p.nombreProducto, c.apellido, c.nombre 
            from rating r inner join producto p on r.productoId = p.id inner join cliente c on r.clienteId = c.id limit ${take} offset ${pagina} `);
            // producto.map(prod =>{
            //     delete prod.proveedor.email;
            //     delete prod.proveedor.telefono;
            //     delete prod.proveedor.direccion;
            //     delete prod.proveedor.status;
            //     delete prod.marca.status;
            //     delete prod.categoria.status;
            //     return producto
            // });
            if (rating.length > 0) {
                res.json({rating})
            } else {
                res.json({message : 'No se encontraron resultados'})
            }
        } catch (error) {
            res.json({message:'Algo ha salido mal'})
        }
        
    };

    //Mostrar rating pajinado
    static MostrarRatingPaginados = async ( req : Request, res : Response ) => {
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const ratingsRepo = getRepository(Rating);
            const [ratings, totalItems] = await ratingsRepo.createQueryBuilder('rating')
            .innerJoin('rating.cliente', 'cliente')
            .innerJoin('rating.producto', 'producto')
            .addSelect(['cliente.nombre', 'cliente.apellido'])
            .addSelect(['producto.nombreProducto'])
            .skip((pagina - 1 ) * take)
            .take(take)
            .getManyAndCount()

            if (ratings.length > 0) {
                let totalPages : number = totalItems / take;
                if(totalPages % 1 == 0 ){
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage : number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage : number = pagina <= 1 ? pagina : pagina -1
                res.json({ok: true, ratings, totalItems, totalPages, currentPage : pagina, nextPage, prevPage})
            } else {
                res.json({message : 'No se encontraron resultados!'})
            }
        } catch (error) {
            res.json({message : 'Algo ha salido mal!'})
        }
    };

    //Mostrar rating por producto
    static MostrarRatingPorProducto = async ( req : Request, res : Response ) => {
        const {producto} = req.body;
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const ratingsRepo = getRepository(Rating);
            const [ratings, totalItems] = await ratingsRepo.createQueryBuilder('rating')
            .innerJoin('rating.cliente', 'cliente')
            .innerJoin('rating.producto', 'producto')
            .addSelect(['cliente.nombre', 'cliente.apellido'])
            .addSelect(['producto.nombreProducto'])
            .skip((pagina - 1 ) * take)
            .take(take)
            .where({producto})
            .getManyAndCount()

            if (ratings.length > 0) {
                let totalPages : number = totalItems / take;
                if(totalPages % 1 == 0 ){
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage : number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage : number = pagina <= 1 ? pagina : pagina -1
                res.json({ok: true, ratings, totalItems, totalPages, currentPage : pagina, nextPage, prevPage})
            } else {
                res.json({message : 'No se encontraron resultados!'})
            }
        } catch (error) {
            res.json({message : 'Algo ha salido mal!'})
        }
    }

    //Actualizar rating realizados por el usuario logado
    static ActualizarRating = async (req : Request, res : Response) =>{
        let rating;
        const { clienteid } = res.locals.jwtPayload;
        const {id} = req.params;
        const { ratingNumber, titulo, comentario} = req.body;
        const ratingRepo = getRepository(Rating);
        try {

            rating = await ratingRepo.createQueryBuilder('rating')
            .leftJoin('rating.cliente', 'rc')
            .addSelect(['rc.id', 'rc.nombre', 'rc.apellido'])
            .where({id})
            .getOneOrFail();

            rating.ratingNumber = ratingNumber,
            rating.titulo = titulo,
            rating.comentario = comentario
            
            console.log(rating);
            if ((rating.cliente.id === clienteid)){
                await ratingRepo.save(rating);
                // await ratingRepo.createQueryBuilder().update(Rating).set({ratingNumber, titulo, comentario}).where({id}).execute();
            }
            else{
                return res.json({message: 'No puedes modificar este comentario'})
            }

        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados con el id: ' + id})
        }

        res.json({messge:'Datos actulizados!'});
    };
    
    //eliminar ratin hechos por el usuario logado
    static EliminarRating = async (req : Request, res : Response) =>{
        let rating;
        const { clienteid } = res.locals.jwtPayload;
        const {id} = req.params;
        const ratingRepo = getRepository(Rating);
        try {

            rating = await ratingRepo.createQueryBuilder('rating')
            .leftJoin('rating.cliente', 'rc')
            .addSelect(['rc.id', 'rc.nombre', 'rc.apellido'])
            .where({id})
            .getOneOrFail();
            
            console.log(rating);
            if ((rating.cliente.id === clienteid)){
                await ratingRepo.delete(id);
            }
            else{
                return res.json({message: 'No puedes eliminar rating ageno'})
            }
        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados con el id: ' + id})
        }

        res.json({messge:'Rating Eliminado!'});
    };

     //mostrar rating id
    static RatingPorId = async ( req : Request, res : Response) => {
        let rating;
        const { id } = req.params;
        try {
            const ratingRepo = getRepository(Rating)
            rating = await ratingRepo.query(` select r.id, r.ratingNumber, r.titulo, r.comentario, p.nombreProducto, c.apellido, c.nombre 
            from rating r 
            inner join producto p on r.productoId = p.id inner join cliente c on r.clienteId = c.id 
            where r.id = '${id}'`)

            if (rating.length > 0) {
                res.json({ rating})
            } else {
                res.json({message : 'No se encontraron resultados con el id: ' + id})
            }
        } catch (error) {
            res.json({message:'Algo ha salido mal'})
        }
    };

}
export default RatingController;