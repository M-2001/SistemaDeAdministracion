import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Employee } from '../entity/Employee';
import * as fs from 'fs';
import * as path from 'path';
import * as fileUpload from 'express-fileupload';
import { UploadedFile } from 'express-fileupload';


export class EmpleadoController{

    //GetAll Employees
    static getEmpleados = async(req: Request, res: Response)=>{
        const empleadoRepo = getRepository(Employee);
        try{
            const empl = await empleadoRepo.find();
            empl.map(empl =>{
                delete empl.password;
                delete empl.hashPassword;
                return empl
            });
            if(empl.length>0){
            res.send(empl);
        }
        else{
            res.status(404).json({message:'Not results!'});
            }
        }
        catch(e){
            res.status(404).json({message:'Not results!'});
        }
    };
    //getEmployeeByID
    static getEmpleadoByID = async (req: Request, res: Response)=>{
        const{id} = req.params;
        const employeeRepo = getRepository(Employee);
        try{
            const employee = await employeeRepo.findOneOrFail({select :[`id`, `apellido`, `nombre`, `email`,`telefono`,`direccion`,`imagen`, 'role',`estado`],
        where:{id}});
        const imgdir = path.resolve(__dirname, `../../src/uploads/employee/${employee.imagen}`);
            if(fs.existsSync(imgdir)){
                res.sendFile(imgdir);
            }else{
                const notImage = path.resolve(__dirname, `../../src/server/assets/${employee.imagen}`);
                res.sendFile(notImage);
            }
        }
        catch(e){
            res.status(404).json({message:'No hay registros con este id: ' + id });
        }
    };
    //create new employee
    static AgregarEmpleado = async(req: Request, res:Response)=>{

        const{apellido, nombre, email, password, role, estado} = req.body;

        const empRepo = getRepository(Employee);
        const emailExist = await empRepo.findOne({
            where: {email: email}
        });
        if(emailExist){
            return res.status(400).json({msj:'Ya existe un usuario con el email' + email})
        }
        
        const employee = new Employee();
        employee.apellido = apellido;
        employee.nombre = nombre;
        employee.email = email;
        employee.password = password;
        employee.role = role;
        employee.estado = estado;

        //validations
        const ValidateOps = {validationError:{target: false, value: false}};
        const errors = await validate(employee, ValidateOps);
        if (errors.length > 0){
            return res.status(400).json({errors});
        }
        //TODO: HASH PASSWORD
        try{
            employee.hashPassword();
            await empRepo.save(employee);
        }
        catch(e){
            res.status(409).json({message: 'something goes wrong'});
        }
        //all ok
        res.json({mjs: 'Empleado se creo con exito'})
    };
    //delete employee
    static EliminarEmpleado = async (req: Request, res:Response)=>{
        const {id} = req.params;
        const empRepo = getRepository(Employee);
        try{
            const empl = await empRepo.findOneOrFail(id);
            await empRepo.delete(empl);
            const imgdir = path.resolve(__dirname, `../../src/uploads/employee/${empl.imagen}`);
            if(fs.existsSync(imgdir)){
                fs.unlinkSync(imgdir)
            }
            //delete 
            res.status(201).json({message:'Empleado eliminado'});
        }
        catch(e){
            res.status(404).json({message:'No hay registros con este id: ' + id});
        }
    };
    //Editar Employee
    static EditarEmpleado = async (req : Request, res : Response)=>{
        let employee;
        const {id} = req.params;
        const {apellido, nombre, telefono, direccion} = req.body;
        const emplRepo = getRepository(Employee);

        try {
            employee = await emplRepo.findOneOrFail(id);
            employee.apellido = apellido;
            employee.nombre = nombre;
            employee.telefono = telefono;
            employee.direccion = direccion;

        } catch (error) {
            return res.status(404).json({message:'No se han encontrado resultados '})
        }

        const ValidateOps = {validationError:{target: false, value: false}};
        const errors = await validate(employee, ValidateOps);

        //try to save employee
        try {
            await emplRepo.save(employee)
        } catch (error) {
            return res.status(409).json({message:'Algo ha salido mal!'});
        }

        res.json({messge:'Este id: ' + id + ' servira para actualizar el registro!'});
        console.log(id);
    }
    //subir imagen perfil
    static ImagenPerfilEmpleado = async (req : Request, res : Response)=>{
        const{id} = res.locals.jwtPayload;
        const employeeRepo = getRepository(Employee);
        let employee;
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
                    foto.mv(`src/uploads/employee/${nombreFoto}`, (err)=>{
                        if (err) {
                        return res.status(500).json({ok: false, err});
                        } 
                    });
                    try{
                        const employee = await employeeRepo.findOneOrFail({select :[`id`, `apellido`, `nombre`, `email`,`telefono`,`direccion`,`imagen`, 'role',`estado`],
                    where:{id}});
                    const imgdir = path.resolve(__dirname, `../../src/uploads/employee/${employee.imagen}`);
                        if(fs.existsSync(imgdir)){
                            fs.unlinkSync(imgdir)
                        }
                        console.log(employee);
                    }
                    catch(e){
                        res.status(404).json({message:'No hay registros con este id: ' + id });
                    }
                    //try to save employee
                    try {
                        await employeeRepo.createQueryBuilder().update(Employee).set({imagen: nombreFoto}).where({id}).execute();
                    } catch (error) {
                        res.status(409).json({message:'Algo ha salido mal!'});
                    }
                }
                res.json({message:'La imagen se ha guardado.'});
        }
    }
}