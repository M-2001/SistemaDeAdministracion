import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Categoria } from '../entity/Categoria';
import { Producto } from '../entity/Producto';
class CategoriaController {

    //mostrar categorias
    static MostrarCategorias = async (_: Request, res: Response) => {
        try {
            const categoriaRepo = getRepository(Categoria)
            const categoria = await categoriaRepo.find({where : {status : true}})
            if (categoria.length > 0) {
                res.json({ok: true ,categoria})
            } else {
                res.json({ ok: false,  message: 'No se encontraron resultados' })
            }
        } catch (error) {
            res.json({ok : false, message: 'Algo ha salido mal' })
        }
    };

    //Mostrar categorias paginadas
    static MostrarCategoriasPaginadas = async (req: Request, res: Response) => {
        let pagina = req.query.pagina || 1;
        let category = req.query.categoria || "";
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const categoriasRepo = getRepository(Categoria);
            const [categorias, totalItems] = await categoriasRepo.createQueryBuilder('categoria')
                .skip((pagina - 1) * take)
                .take(take)
                .where("categoria.categoria like :name", { name: `%${category}%` })
                .getManyAndCount()
            if (categorias.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                res.json({ ok: true, categorias, totalItems, totalPages, currentPage: pagina, nextPage, prevPage })
            } else {
                res.json({ok: false, message: 'No se encontraron resultados!' })
            }
        } catch (error) {
            res.json({ok: false, message: 'Algo ha salido mal!' })
        }
    }

    //agregar una nueva categoria
    static AgregarCategoria = async (req: Request, res: Response) => {
        const { categoria } = req.body;
        try {
            const categoriaRepo = getRepository(Categoria);
            const categoryExist = await categoriaRepo.findOne({ where: { categoria: categoria } });
            console.log(categoryExist);
            if (categoryExist) {
                return res.status(400).json({ok: false, message: 'Ya existe una categoria con ese nombre' })
            }
            const category = new Categoria()
            category.categoria = categoria
            //validations
            const ValidateOps = { validationError: { target: false, value: false } };
            const errors = await validate(category, ValidateOps);
            if (errors.length > 0) {
                return res.status(400).json({ok: false,errors });
            }
            await categoriaRepo.save(category);
            //all ok
            res.json({ok: true, message: 'Se ha agregado una nueva categoria' });
        } catch (error) {
            res.status(400).json({ok: false, message: 'Algo ha salio mal!' });
        }
    };

    //obtener categoria por ID
    static ObtenerCategoriaPorID = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const categoriaRepo = getRepository(Categoria)
            const categoria = await categoriaRepo.findOneOrFail({ where: { id } });
            res.json({ok: true, categoria })
        } catch (error) {
            return res.status(404).json({ok: false, message: 'No hay registros con este id: ' + id });
        }
    };

    //actualizar categoria
    static ActualizarCategoria = async (req: Request, res: Response) => {
        let category;
        const { id } = req.params;
        const { categoria } = req.body;
        const categoriaRepo = getRepository(Categoria);
        try {
            category = await categoriaRepo.findOneOrFail({ where: { id } });
            category.categoria = categoria
        } catch (error) {
            return res.status(404).json({ok:false, message: 'No se han encontrado resultados ' });
        }
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await validate(category, ValidateOps);
        //Try to save data Category
        try {
            await categoriaRepo.save(category)
            res.json({ok: true, message: 'Se actualizo el registro!' });
        } catch (error) {
            return res.status(409).json({ok: false, message: 'Algo ha salido mal!' });
        }
    };

    //eliminar categoria
    static EliminarCategoria = async (req: Request, res: Response) => {
        let category;
        const { id } = req.params;
        const categoriaRepo = getRepository(Categoria);
        try {
            category = await categoriaRepo.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(404).json({ok: false, message: 'No se han encontrado resultados ' })
        }
        //Try to delete Category
        try {
            await categoriaRepo.remove(category)
            res.json({ok: true, messge: 'Categoria ha sido eliminada!' });
        } catch (error) {
            return res.send({ok: false, message: 'No puedes eliminar esta categoria porque podria haber registros vinculados' });
        }
    };

    //estado categoria
    static EstadoCategoria = async (req: Request, res: Response) => {
        let categoria : Categoria;
        const id = req.body;
        const categoriaRepo = getRepository(Categoria);
		const productoRepo = getRepository(Producto);
        try {
            categoria = await categoriaRepo.findOneOrFail(id)

        } catch (error) {
            return res.json({ ok: false, message: `Categoria con el id: ${req.body.id} no encontrada!!!` });
        }

		try {
			const [producto, totalResult] = await productoRepo.findAndCount({where: { categoria : categoria}});
			if (totalResult > 0) {
				return res.status(300).json({ok: false, message : `Advertencia: No se puede modificar el estado con el id: ${categoria.id} porque tiene registros asociados!`});
			} else {
				if (categoria.status == true) {
                categoria.status = false
            } else {
                categoria.status = true
            }

            const categoriaStatus = await categoriaRepo.save(categoria)
            res.json({ ok: true, message:'Estado de categoria actualizado!' });
			}
		} catch (error) {
			return res.json({ok: false, message: "Sucedio un error Inesperado!!!"});
		}
    };

}
export default CategoriaController;