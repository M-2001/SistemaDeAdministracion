import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { STATUS_CODES } from 'http';
import { getRepository } from 'typeorm';
import { Categoria } from '../entity/Categoria';
class CategoriaController{

    static MostrarCategorias = async ( req : Request, res : Response) => {
        try {
            const categoriaRepo = getRepository(Categoria)
            const categoria = await categoriaRepo.find()
            if (categoria.length > 0) {
                res.json(categoria)
            } else {
                res.json({message : 'No se encontraron resultados'})
            }
        } catch (error) {
            res.json({message:'Algo ha salido mal'})
        }
    };

    static MostrarCategoriasPaginadas = async ( req : Request, res : Response ) => {
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const categoriasRepo = getRepository(Categoria);
            const [categorias, totalItems] = await categoriasRepo.findAndCount({take, skip : (pagina -1) * take});
            if (categorias.length > 0) {
                let totalPages : number = totalItems / take;
                if(totalPages % 1 == 0 ){
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage : number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage : number = pagina <= 1 ? pagina : pagina -1
                res.json({ok: true, categorias, totalItems, totalPages, currentPage : pagina, nextPage, prevPage})
            } else {
                res.json({message : 'No se encontraron resultados!'})
            }
        } catch (error) {
            res.json({message : 'Algo ha salido mal!'})
        }
    }

    static AgregarCategoria = async (req: Request, res : Response)=>{
        const {categoria} = req.body;
        try {
            const categoriaRepo = getRepository(Categoria);
            const categoryExist = await categoriaRepo.findOne({where: {categoria : categoria}});
            console.log(categoryExist);
            if (categoryExist) {
                return res.status(400).json({message : 'Ya existe una categoria con ese nombre'})
            } 
                const category = new Categoria()
                category.categoria = categoria
                //validations
                const ValidateOps = {validationError:{target: false, value: false}};
                const errors = await validate(category, ValidateOps);
                if (errors.length > 0){
                    return res.status(400).json({errors});
                }
                await categoriaRepo.save(category);
        } catch (error) {
            res.status(400).json({message : 'Algo ha salio mal!'});
        }
        //all ok 
        res.json({message : 'Se ha agregado una nueva categoria'});
    };

    static ObtenerCategoriaPorID = async (req: Request, res: Response) => {
        const {id} = req.params;
        try {
            const categoriaRepo = getRepository(Categoria)
            const categoria = await categoriaRepo.findOneOrFail({where : {id}});
            res.json({categoria})
        } catch (error) {
            return res.status(404).json({message:'No hay registros con este id: ' + id });
        }
    };

    static ActualizarCategoria = async ( req : Request, res : Response) =>{
        let category;
        const {id} = req.params;
        const {categoria} = req.body;
        const categoriaRepo = getRepository(Categoria);
        try {
            category = await categoriaRepo.findOneOrFail({where:{id}});
            category.categoria = categoria
        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados '})
        }
        const ValidateOps = {validationError:{target: false, value: false}};
        const errors = await validate(category, ValidateOps);
        //Try to save data Category
        try {
            await categoriaRepo.save(category)
        } catch (error) {
            return res.status(409).json({message:'Algo ha salido mal!'});
        }
        res.json({messge:'Se actualizo el registro!'});
        console.log(id);
    };

    static EliminarCategoria = async ( req : Request, res : Response) =>{
        let category;
        const {id} = req.params;
        const categoriaRepo = getRepository(Categoria);
        try {
            category = await categoriaRepo.findOneOrFail({where:{id}});
        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados '})
        }
        //Try to delete Category
        try {
            await categoriaRepo.remove(category)
        } catch (error) {
            return res.status(409).json({message:'Algo ha salido mal!'});
        }
        res.json({messge:'Categoria ha sido eliminada!'});
    };

     //estado categoria
    static EstadoCategoria = async ( req : Request, res : Response) => {
        let categoria;
        const id = req.body;
        const categoriaRepo = getRepository(Categoria);
        try {
            categoria = await categoriaRepo.findOneOrFail(id)

            if(categoria.status == true){
                categoria.status = false
            }else{
                categoria.status = true
            }
            
            const categoriaStatus = await categoriaRepo.save(categoria)
            res.json({ok : true, categoria : categoriaStatus.status })
        
        } catch (error) {
            console.log(error);
        }
    };

}
export default CategoriaController;