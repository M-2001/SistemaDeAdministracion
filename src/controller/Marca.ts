import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { getRepository } from 'typeorm';
import { Marca } from '../entity/Marca';
class MarcaController {

    static MostrarMarcas = async (req: Request, res: Response) => {
        try {
            const marcaRepo = getRepository(Marca);
            const marca = await marcaRepo.find()
            if (marca.length > 0) {
                res.json(marca)
            } else {
                res.json({ message: 'No se encontraron resultados' })
            }
        } catch (error) {
            res.json({ message: 'Algo ha salido mal' })
        }
    };

    static MostrarMarcasPaginadas = async (req: Request, res: Response) => {
        let pagina = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take)
        try {
            const marcasRepo = getRepository(Marca)
            const [marcas, totalItems] = await marcasRepo.findAndCount({ take: take, skip: (pagina - 1) * take })
            if (marcas.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                res.json({ marcas, totalItems, totalPages, currentPage: pagina, nextPage, prevPage })
            } else {
                res.json({ message: 'No se encontraron resultados' })
            }
        } catch (error) {
            res.json({ message: 'Algo ha salido mal' })
        }
    }


    static AgregarMarca = async (req: Request, res: Response) => {
        const { marca } = req.body;
        try {
            const marcaRepo = getRepository(Marca);
            const marcaExist = await marcaRepo.findOne({ where: { marca: marca } });
            console.log(marcaExist);
            if (marcaExist) {
                return res.status(400).json({ message: 'Ya existe una marca con ese nombre' })
            }
            const marc = new Marca()
            marc.marca = marca
            //validations
            const ValidateOps = { validationError: { target: false, value: false } };
            const errors = await validate(marc, ValidateOps);
            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }
            await marcaRepo.save(marc);
        } catch (error) {
            res.status(400).json({ message: 'Algo ha salio mal!' });
        }
        //all ok 
        res.json({ message: 'Se ha agregado una nueva marca' });
    };

    static ObtenerMarcaPorID = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const marcaRepo = getRepository(Marca)
            const marca = await marcaRepo.findOneOrFail({ where: { id } });
            res.json({ marca })
        } catch (error) {
            return res.status(404).json({ message: 'No hay registros con este id: ' + id });
        }
    };

    static ActualizarMarca = async (req: Request, res: Response) => {
        let marc;
        const { id } = req.params;
        const { marca } = req.body;
        const marcaRepo = getRepository(Marca);
        try {
            marc = await marcaRepo.findOneOrFail({ where: { id } });
            marc.marca = marca
        } catch (error) {
            return res.status(404).json({ message: 'No se han encontrado resultados con el id: ' + id })
        }
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await validate(marc, ValidateOps);
        //Try to save data Category
        try {
            await marcaRepo.save(marc)
        } catch (error) {
            return res.status(409).json({ message: 'Algo ha salido mal!' });
        }
        res.json({ messge: 'Se actualizo el registro!' });
    };

    static EliminarMarca = async (req: Request, res: Response) => {
        let marca;
        const { id } = req.params;
        const marcaRepo = getRepository(Marca);
        try {
            marca = await marcaRepo.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(404).json({ message: 'No se han encontrado resultados ' })
        }
        //Try to delete Category
        try {
            await marcaRepo.remove(marca)
        } catch (error) {
            return res.status(409).json({ message: 'Algo ha salido mal!' });
        }
        res.json({ messge: 'Marca ha sido eliminada!' });
    };
}
export default MarcaController;