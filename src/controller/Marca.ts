import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Marca } from '../entity/Marca';
class MarcaController {

    //mostrar marcas
    static MostrarMarcas = async (_: Request, res: Response) => {
        try {
            const marcaRepo = getRepository(Marca);
            const marca = await marcaRepo.find()
            if (marca.length > 0) {
                res.json({ok: true, marca});
            } else {
                res.json({ok: false, message: 'No se encontraron resultados' })
            }
        } catch (error) {
            res.json({ok: false, message: 'Algo ha salido mal' })
        }
    };
    //mostrar marcas paginadas
    static MostrarMarcasPaginadas = async (req: Request, res: Response) => {
        let pagina = req.query.pagina || 1;
        let mark = req.query.marca || '';
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const marcasRepo = getRepository(Marca);
            const [marcas, totalItems] = await marcasRepo.createQueryBuilder('marca').skip((pagina - 1) * take)
                .take(take)
                .where("marca.marca like :name", { name: `%${mark}%` })
                .getManyAndCount()
            if (marcas.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                res.json({ ok: true, marcas, totalItems, totalPages, currentPage: pagina, nextPage, prevPage })
            } else {
                res.json({ok: false, message: 'No se encontraron resultados!' })
            }
        } catch (error) {
            res.json({ok: false, message: 'Algo ha salido mal!' })
        }
    }

    //agregar una nueva marca
    static AgregarMarca = async (req: Request, res: Response) => {
        const { marca } = req.body;
        try {
            const marcaRepo = getRepository(Marca);
            const marcaExist = await marcaRepo.findOne({ where: { marca: marca } });
            //console.log(marcaExist);
            if (marcaExist) {
                return res.status(400).json({ok: false, message: 'Ya existe una marca con ese nombre' })
            }
            const marc = new Marca()
            marc.marca = marca
            //validations
            const ValidateOps = { validationError: { target: false, value: false } };
            const errors = await validate(marc, ValidateOps);
            if (errors.length > 0) {
                return res.status(400).json({ok:false, errors });
            }
            await marcaRepo.save(marc);
            //all ok 
            res.json({ok: true, message: 'Se ha agregado una nueva marca' });

        } catch (error) {
            res.status(400).json({ok:false, message: 'Algo ha salio mal!' });
        }
    };

    //mostrar marca por ID
    static ObtenerMarcaPorID = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const marcaRepo = getRepository(Marca)
            const marca = await marcaRepo.findOneOrFail({ where: { id } });
            res.json({ok: true, marca });
        } catch (error) {
            return res.status(404).json({ok: false, message: 'No hay registros con este id: ' + id });
        }
    };

    //actualizar marca
    static ActualizarMarca = async (req: Request, res: Response) => {
        let marc: Marca;
        const { id } = req.params;
        const { marca } = req.body;
        const marcaRepo = getRepository(Marca);
        try {
            marc = await marcaRepo.findOneOrFail({ where: { id } });
            marc.marca = marca
        } catch (error) {
            return res.status(404).json({ok: false, message: 'No se han encontrado resultados con el id: ' + id })
        }
        //Try to save data Category
        try {
            await marcaRepo.save(marc)
            res.json({ok: true, messge: 'Se actualizo el registro!' });
        } catch (error) {
            return res.status(409).json({ok: false, message: 'Algo ha salido mal!' });
        }
    };

    //eliminar una marca
    static EliminarMarca = async (req: Request, res: Response) => {
        let marca: Marca;
        const { id } = req.params;
        const marcaRepo = getRepository(Marca);
        try {
            marca = await marcaRepo.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(404).json({ok: false, message: 'No se han encontrado resultados ' })
        }
        //Try to delete marca
        try {
            await marcaRepo.remove(marca)
            res.json({ok: true, messge: 'Marca ha sido eliminada!'});
        } catch (error) {
            return res.send({ok: false, message: 'No puedes eliminar esta marca porque podria haber registros vinculados' });
        }
    };

    //Cambiar estado de una marca
    static EstadoMarca = async (req: Request, res: Response) => {
        let marca: Marca;
        const id = req.body;
        const marcaRepo = getRepository(Marca);
        try {
            marca = await marcaRepo.findOneOrFail(id)

            if (marca.status == true) {
                marca.status = false
            } else {
                marca.status = true
            }

            const marcaStatus = await marcaRepo.save(marca)
            res.json({ ok: true, message: 'Estado de marca actualizado!' });

        } catch (error) {
            res.json({ok: false, message: 'Algo salio mal!'});
        }
    };
}
export default MarcaController;