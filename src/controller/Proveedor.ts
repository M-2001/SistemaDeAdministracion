import { validate } from 'class-validator';
import { Request, Response } from 'express';
import { Proveedor } from '../entity/Proveedor';
import { getRepository } from 'typeorm';

class ProveedorController {

    static MostrarProveedors = async (_: Request, res: Response) => {
        try {
            const proveedorRepo = getRepository(Proveedor);
            const proveedor = await proveedorRepo.find()
            if (proveedor.length > 0) {
                res.json(proveedor)
            } else {
                res.json({ message: 'No se encontraron resultados' })
            }
        } catch (error) {
            res.json({ message: 'Algo ha salido mal' })
        }
    };

    static MostrarProveedoresPaginados = async (req: Request, res: Response) => {
        let pagina = req.query.pagina || 1;
        let provider = req.query.proveedor || '';
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const proveedoresRepo = getRepository(Proveedor);
            const [proveedores, totalItems] = await proveedoresRepo.createQueryBuilder('proveedor').skip((pagina - 1) * take)
                .take(take)
                .where("proveedor.nombre_proveedor like :name", { name: `%${provider}%` })
                .getManyAndCount()
            if (proveedores.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                res.json({ ok: true, proveedores, totalItems, totalPages, currentPage: pagina, nextPage, prevPage })
                console.log(proveedores.length);
            } else {
                res.json({ message: 'No se encontraron resultados!' })
            }
        } catch (error) {
            res.json({ message: 'Algo ha salido mal!' })
        }
    }

    static AgregarProveedor = async (req: Request, res: Response) => {
        const { nombre, email, telefono, direccion } = req.body;
        try {
            const proveedorRepo = getRepository(Proveedor);
            const proveedorExist = await proveedorRepo.findOne({ where: { nombre_proveedor: nombre } });
            console.log(proveedorExist);
            if (proveedorExist) {
                return res.status(400).json({ message: 'Ya existe una proveedor con ese nombre' })
            }
            const proveedor = new Proveedor()
            proveedor.nombre_proveedor = nombre;
            proveedor.email = email;
            proveedor.telefono = telefono;
            proveedor.direccion = direccion;

            //validations
            const ValidateOps = { validationError: { target: false, value: false } };
            const errors = await validate(proveedor, ValidateOps);

            if (errors.length > 0) {
                return res.status(400).json({ errors });
            }
            await proveedorRepo.save(proveedor);
        } catch (error) {
            res.status(400).json({ message: 'Algo ha salio mal!' });
        }
        //all ok 
        res.json({ message: 'Se agrego un nuevo proveedor' });
    };

    static ObtenerProveedorPorID = async (req: Request, res: Response) => {
        const { id } = req.params;
        try {
            const proveedorRepo = getRepository(Proveedor)
            const proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
            res.json({ proveedor })
        } catch (error) {
            return res.status(404).json({ message: 'No hay registros con este id: ' + id });
        }
    };

    static ActualizarProveedor = async (req: Request, res: Response) => {
        let proveedor;
        const { id } = req.params;
        const { nombre, email, telefono, direccion } = req.body;
        const proveedorRepo = getRepository(Proveedor);
        try {
            proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
            proveedor.nombre_proveedor = nombre,
                proveedor.email = email,
                proveedor.telefono = telefono,
                proveedor.direccion = direccion

        } catch (error) {
            return res.status(404).json({ message: 'No se han encontrado resultados con el id: ' + id })
        }
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await validate(proveedor, ValidateOps);
        //Try to save data Category
        try {
            await proveedorRepo.save(proveedor)
        } catch (error) {
            return res.status(409).json({ message: 'Algo ha salido mal!' });
        }
        res.json({ messge: 'Se actualizo el registro!' });
    };

    static EliminarProveedor = async (req: Request, res: Response) => {
        let proveedor:Proveedor;
        const { id } = req.params;
        const proveedorRepo = getRepository(Proveedor);
        try {
            proveedor = await proveedorRepo.findOneOrFail({ where: { id } });
        } catch (error) {
            return res.status(404).json({ message: 'No se han encontrado resultados ' })
        }
        //Try to delete Category
        try {
            await proveedorRepo.remove(proveedor)
        } catch (error) {
            return res.send({ message: 'No puedes eliminar este proveedor porque hay registros implicados' });
        }
        res.json({ messge: 'Proveedor ha sido eliminada!',ok:true });
    };
    //estado proveedor
    static EstadoProveedor = async (req: Request, res: Response) => {
        let proveedor:Proveedor;
        const id = req.body;
        const proveedorRepo = getRepository(Proveedor);
        try {
            proveedor = await proveedorRepo.findOneOrFail(id)

            if (proveedor.status == true) {
                proveedor.status = false
            } else {
                proveedor.status = true
            }

            const proveedorStatus = await proveedorRepo.save(proveedor)
            res.json({ ok: true, proveedor: proveedorStatus.status })

        } catch (error) {
            console.log(error);
        }
    };
}
export default ProveedorController;