import { Cliente } from '../entity/Cliente';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { validate } from 'class-validator';
import * as path from 'path';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';
import * as jwt from 'jsonwebtoken';
import { transporter } from '../config/nodemailer.config';
import { Order } from '../entity/Order';

interface OrdenesClient {
    client: {
        nombre: string,
        apellido: string,
        email: string,
        telefono: string,
        direccion: string,
        id: number,
        estado: boolean,
        foto: string
    }
    ordenes: number
}
class ClienteController {
    //create new cliente
    static RegistroCliente = async (req: Request, res: Response) => {

        const { apellido, nombre, email, password } = req.body;
        const token = jwt.sign({ email: req.body.email }, process.env.JWTSECRET, {
            expiresIn: '1h'
        });

        const clienteRepo = getRepository(Cliente);
        let cliente;
        const message = "Se creo la cuenta con exito";
        let verifycationLink;
        let emailStatus = 'Ok';

        //buscar en base de datos si no existen registros con el mismo email
        const emailExist = await clienteRepo.findOne({
            where: { email: email }
        });

        if (emailExist) {
            return res.send({ ok:false,message: 'Ya existe un usuario con el email' })
        }
        //Si no existe un resultado devuelto procede a crearlo
        cliente = new Cliente();
        cliente.apellido = apellido;
        cliente.nombre = nombre;
        cliente.email = email;
        cliente.password = password;
        cliente.confirmacionCode = token;

        //validations
        const ValidateOps = { validationError: { target: false, value: false } };
        const errors = await validate(cliente, ValidateOps);
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        try {
            verifycationLink = `https://client-systempc.vercel.app/active/${token}`;

        } catch (e) {
            return res.json({ error: 'something goes wrong!' });
        }

        //TODO: sendEmail
        try {
            await transporter.sendMail({
                from: '"Confirmacion de Cuenta " <castlem791@gmail.com>', //sender address
                to: cliente.email,
                subject: "Confirmacion de cuenta",
                html: `<b>Please check on the following link , or paste this into your browser to complete the process:</b> 
        <a href="${verifycationLink}">${verifycationLink}</a>`,
            });
        } catch (error) {
            emailStatus = error;
            return res.status(401).json({ message: 'Something goes wrong!' });
        }
        //all ok
        //TODO: HASH PASSWORD
        try {
            cliente.hashPassword();
            clienteRepo.save(cliente);
        }
        catch (e) {
            res.status(409).json({ message: 'something goes wrong' });
        }
        //res.json({mjs: 'Registro creado con exito!'})
        res.send({ message,ok:true });

    };
    //Obtener todos los empleados
    static getClientes = async (req: Request, res: Response) => {
        let pagina = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = 5;
        take = Number(take)
        const clienteRepo = getRepository(Cliente);
        try {
            const [cliente, totalItems] = await clienteRepo.createQueryBuilder().skip((pagina - 1) * take).take(take).getManyAndCount();
            cliente.map(cliente => {
                delete cliente.password;
                delete cliente.resetPassword;
                delete cliente.confirmacionCode;
                delete cliente.role;
                return cliente
            });
            if (cliente.length > 0) {
                let totalPages: number = totalItems / take;
                if (totalPages % 1 !== 0) {
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                res.json({ ok: true, cliente, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false })
            }
            else {
                res.status(404).json({ message: 'Not results!' });
            }
        }
        catch (e) {
            res.status(404).json({ message: 'Not results!' });
        }
    };
    //subir imagen perfil
    static ImagenPerfilCliente = async (req: Request, res: Response) => {
        const { id } = req.params
        const clienteRepo = getRepository(Cliente);
        let cliente;
        if (req.files === undefined || req.files.foto === undefined) {
            res.status(400).json({ ok: false, message: 'Ningun archivo selecionando' });
        } else {
            let foto = req.files.foto as UploadedFile;
            let fotoName = foto.name.split('.')
            console.log(fotoName);
            let ext = fotoName[fotoName.length - 1];
            //extensiones permitidas 
            const extFile = ['png', 'jpeg', 'jpg', 'git'];
            if (extFile.indexOf(ext) < 0) {
                return res.status(400)
                    .json({ message: 'Las estensiones permitidas son ' + extFile.join(', ') })
            }
            else {
                //cambiar nombre del archivo
                var nombreFoto = `${id}-${new Date().getMilliseconds()}.${ext}`
                foto.mv(`src/uploads/usuarios/${nombreFoto}`, (err) => {
                    if (err) {
                        return res.status(500).json({ ok: false, err });
                    }
                });
                try {
                    const cliente = await clienteRepo.findOneOrFail({
                        select: [`id`, `apellido`, `nombre`, `email`, `telefono`, `direccion`, `imagen`, 'role', `estado`],
                        where: { id }
                    });
                    const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios/${cliente.imagen}`);
                    if (fs.existsSync(imgdir)) {
                        fs.unlinkSync(imgdir)
                    }
                    console.log(cliente);
                }
                catch (e) {
                    res.status(404).json({ message: 'No hay registros con este id: ' + id });
                }
                //try to save employee
                try {
                    await clienteRepo.createQueryBuilder().update(Cliente).set({ imagen: nombreFoto }).where({ id }).execute();
                } catch (error) {
                    res.status(409).json({ message: 'Algo ha salido mal!' });
                }
            }
            res.json({ message: 'La imagen se ha guardado.', ok: true });
        }
    }
    //getClienteByID
    static getClienteByID = async (req: Request, res: Response) => {
        const { id } = req.params;
        const clienteRepo = getRepository(Cliente);
        try {
            const cliente = await clienteRepo.findOneOrFail({
                select: [`id`, `apellido`, `nombre`, `email`, `telefono`, `direccion`, `imagen`,],
                where: { id }
            });
            if (cliente) {
                res.json({ cliente })
            } else {
                res.json({ message: "No se encontraron resultados" })
            }
        }
        catch (e) {
            res.status(404).json({ message: 'No hay registros con este id: ' + id });
        }
    };
    //Editar cliente
    static EditarCliente = async (req: Request, res: Response) => {
        let cliente;
        const { id } = req.params
        const { apellido, nombre, telefono, direccion } = req.body;
        const emplRepo = getRepository(Cliente);

        try {
            cliente = await emplRepo.findOneOrFail(id);
            cliente.apellido = apellido;
            cliente.nombre = nombre;
            cliente.telefono = telefono;
            cliente.direccion = direccion;

        } catch (error) {
            return res.status(404).json({ message: 'No se han encontrado resultados ', ok: false })
        }

        const ValidateOps = { validationError: { target: false, value: false } };
        //try to save cliente
        try {
            await emplRepo.save(cliente)
        } catch (error) {
            return res.status(409).json({ message: 'Algo ha salido mal!' });
        }
        res.json({ messge: 'Datos actulizados!', ok: true });
    }
    //delete cliente
    static EliminarCliente = async (req: Request, res: Response) => {
        const { id } = req.params;
        const clienteRepo = getRepository(Cliente);
        try {
            const cliente = await clienteRepo.findOneOrFail(id);
            await clienteRepo.delete(cliente);
            const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios${cliente.imagen}`);
            if (fs.existsSync(imgdir)) {
                fs.unlinkSync(imgdir)
            }
            //delete 
            res.status(201).json({ message: 'Empleado eliminado' });
        }
        catch (e) {
            res.status(404).json({ message: 'No hay registros con este id: ' + id });
        }
    }
    static getImage = (req: Request, res: Response) => {
        const name = req.query.image
        const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios/${name}`);
        if (fs.existsSync(imgdir)) {
            res.sendFile(imgdir);
            return;
        }
    }

    //static BestClients
    static MejoresClientes = async (req: Request, res: Response) => {
        let pagina = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = 5;
        take = Number(take)
        const clienteRepo = getRepository(Cliente);
        const ordenRepo = getRepository(Order);
        const OrdenesCliente: OrdenesClient[] = [];

        try {
            const [clientes, totalItems] = await clienteRepo.createQueryBuilder().skip((pagina - 1) * take).take(take).getManyAndCount();
            if (!clientes) {
                return res.status(400).json({ message: 'No se encontraron resultados!!!' });
            } else {
                for (let index = 0; index < clientes.length; index++) {

                    let cliente = clientes[index].id;
                    let client = clientes[index];
                    const newclient = {
                        nombre: client.nombre,
                        apellido: client.apellido,
                        email: client.email,
                        telefono: client.telefono,
                        direccion: client.direccion,
                        estado: client.estado,
                        foto: client.imagen,
                        id: client.id
                    }
                    try {
                        const OrdenesClient = await ordenRepo.createQueryBuilder('orden')
                            .innerJoin('orden.cliente', 'orClt')
                            .addSelect(['orClt.nombre', 'orClt.id', 'orClt.email'])
                            .where({ cliente })
                            .getMany()

                        let items = { client: newclient, ordenes: OrdenesClient.length }
                        OrdenesCliente.push(items)

                    } catch (error) {
                        console.log(error);
                    }

                };
                if (clientes.length > 0) {
                    let totalPages: number = totalItems / take;
                    if (totalPages % 1 !== 0) {
                        totalPages = Math.trunc(totalPages) + 1;
                    }
                    let nextPage: number = pagina >= totalPages ? pagina : pagina + 1
                    let prevPage: number = pagina <= 1 ? pagina : pagina - 1
                    res.json({ ok: true, OrdenesCliente, totalItems, totalPages, currentPage: pagina, nextPage, prevPage, empty: false })
                }
                else {
                    res.status(404).json({ message: 'Not results!' });
                }
            }

        } catch (error) {
            console.log(error);
        }
    }
}
export default ClienteController;