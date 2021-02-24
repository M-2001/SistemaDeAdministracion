import { Cliente } from '../entity/Cliente';
import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { validate } from 'class-validator';
import * as path from 'path';
import * as fs from 'fs';
import { UploadedFile } from 'express-fileupload';

class ClienteController{
    //create new cliente
    static RegistroCliente = async ( req : Request, res : Response) =>{

    const{apellido, nombre, email, password, role, estado} = req.body;

    const clienteRepo = getRepository(Cliente);
    //buscar en base de datos si no existen registros con el mismo email
    const emailExist = await clienteRepo.findOne({
        where: {email: email}
    });

    if(emailExist){
        return res.status(400).json({msj:'Ya existe un usuario con el email' + email})
    }
    //Si no existe un resultado devuelto procede a crearlo
    const cliente = new Cliente();
    cliente.apellido = apellido;
    cliente.nombre = nombre;
    cliente.email = email;
    cliente.password = password;
    cliente.role = role;
    cliente.estado = estado;

    //validations
    const ValidateOps = {validationError:{target: false, value: false}};
    const errors = await validate(cliente, ValidateOps);
    if (errors.length > 0){
        return res.status(400).json({errors});
    }
    //TODO: HASH PASSWORD
    try{
        cliente.hashPassword();
        clienteRepo.save(cliente);
    }
    catch(e){
        res.status(409).json({message: 'something goes wrong'});
    }
    //all ok
    res.json({mjs: 'Registro creado con exito!'})
    };
    //Obtener todos los empleados
    static getClientes = async ( req : Request, res : Response) =>{

    const clienteRepo = getRepository(Cliente);
    try{
        const cliente = await clienteRepo.find();
        cliente.map(cliente =>{
            delete cliente.password;
            delete cliente.hashPassword;
            return cliente
        });
        if(cliente.length>0){
        res.json({cliente});
    }
    else{
        res.status(404).json({message:'Not results!'});
        }
    }
    catch(e){
        res.status(404).json({message:'Not results!'});
    }
    };
    //subir imagen perfil
    static ImagenPerfilCliente = async (req : Request, res : Response)=>{
        const{id} = res.locals.jwtPayload;
        const clienteRepo = getRepository(Cliente);
        let cliente;
        if(req.files === undefined || req.files.foto === undefined ){
            res.status(400).json({ok:false, message:'Ningun archivo selecionando'});
        }else{
            let foto = req.files.foto as UploadedFile;
            let fotoName = foto.name.split('.')
            console.log(fotoName);
            let ext = fotoName[fotoName.length -1];
            //extensiones permitidas 
            const extFile = ['png','jpeg', 'jpg', 'git'];
            if(extFile.indexOf(ext) < 0){
                return res.status(400)
                .json({message:'Las estensiones permitidas son ' + extFile.join(', ')})
            }
                else{
                    //cambiar nombre del archivo
                    var nombreFoto = `${id}-${ new Date().getMilliseconds() }.${ext}`
                    foto.mv(`src/uploads/usuarios/${nombreFoto}`, (err)=>{
                        if (err) {
                        return res.status(500).json({ok: false, err});
                        } 
                    });
                    try{
                        const cliente = await clienteRepo.findOneOrFail({select :[`id`, `apellido`, `nombre`, `email`,`telefono`,`direccion`,`imagen`, 'role',`estado`],
                    where:{id}});
                    const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios/${cliente.imagen}`);
                        if(fs.existsSync(imgdir)){
                            fs.unlinkSync(imgdir)
                        }
                        console.log(cliente);
                    }
                    catch(e){
                        res.status(404).json({message:'No hay registros con este id: ' + id });
                    }
                    //try to save employee
                    try {
                        await clienteRepo.createQueryBuilder().update(Cliente).set({imagen: nombreFoto}).where({id}).execute();
                    } catch (error) {
                        res.status(409).json({message:'Algo ha salido mal!'});
                    }
                }
                res.json({message:'La imagen se ha guardado.'});
        }
    }
    //getClienteByID
    static getClienteByID = async (req: Request, res: Response) =>{
    const{id} = req.params;
    const clienteRepo = getRepository(Cliente);
    try{
        const cliente = await clienteRepo.findOneOrFail({select :[`id`, `apellido`, `nombre`, `email`,`telefono`,`direccion`,`imagen`, 'role',`estado`],
    where:{id}});
    const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios/${cliente.imagen}`);
        if(fs.existsSync(imgdir)){
            res.sendFile(imgdir);
        }else{
            const notImage = path.resolve(__dirname, `../../src/server/assets/${cliente.imagen}`);
            res.sendFile(notImage);
        }
    }
    catch(e){
        res.status(404).json({message:'No hay registros con este id: ' + id });
    }
    };

     //Editar cliente
    static EditarCliente = async ( req : Request, res : Response) =>{
        let cliente;
        const { id } = res.locals.jwtPayload;
        const {apellido, nombre, telefono, direccion} = req.body;
        const emplRepo = getRepository(Cliente);

        try {
            cliente = await emplRepo.findOneOrFail(id);
            cliente.apellido = apellido;
            cliente.nombre = nombre;
            cliente.telefono = telefono;
            cliente.direccion = direccion;

        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados '})
        }

        const ValidateOps = {validationError:{target: false, value: false}};
        const errors = await validate(cliente, ValidateOps);

        //try to save employee
        try {
            await emplRepo.save(cliente)
        } catch (error) {
            return res.status(409).json({message:'Algo ha salido mal!'});
        }
        res.json({messge:'Datos actulizados!'});
        console.log(id);
    }
    //delete cliente
    static EliminarCliente = async (req: Request, res:Response)=>{
        const {id} = req.params;
        const clienteRepo = getRepository(Cliente);
        try{
            const cliente = await clienteRepo.findOneOrFail(id);
            await clienteRepo.delete(cliente);
            const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios${cliente.imagen}`);
            if(fs.existsSync(imgdir)){
                fs.unlinkSync(imgdir)
            }
            //delete 
            res.status(201).json({message:'Empleado eliminado'});
        }
        catch(e){
            res.status(404).json({message:'No hay registros con este id: ' + id});
        }
    }
}
export default ClienteController;