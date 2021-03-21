import { validate } from "class-validator";
import { Request, Response } from "express";
import { getRepository } from "typeorm";
import { Employee } from '../entity/Employee';
import * as fs from 'fs';
import * as path from 'path';
import { UploadedFile } from 'express-fileupload';
import * as jwt from 'jsonwebtoken';


export class EmpleadoController{

    //GetAll Employees
    static getEmpleados = async(req: Request, res: Response)=>{
        const empleadoRepo = getRepository(Employee);
        try{
            const empl = await empleadoRepo.find();
            empl.map(empl =>{
                delete empl.password;
                delete empl.hashPassword;
                return empl;
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
    //empleados Paginados
    static MostrarEmpleadosPaginados = async ( req : Request, res : Response ) => {
        let pagina  = req.query.pagina || 1;
        pagina = Number(pagina);
        let take = req.query.limit || 5;
        take = Number(take);
        try {
            const empleadosRepo = getRepository(Employee);
            const [empleados, totalItems] = await empleadosRepo.createQueryBuilder('empleado')
            .skip((pagina - 1 ) * take)
            .take(take)
            .getManyAndCount()

            if (empleados.length > 0) {
                let totalPages : number = totalItems / take;
                if(totalPages % 1 == 0 ){
                    totalPages = Math.trunc(totalPages) + 1;
                }
                let nextPage : number = pagina >= totalPages ? pagina : pagina + 1
                let prevPage : number = pagina <= 1 ? pagina : pagina -1
                res.json({ok: true, empleados, totalItems, totalPages, currentPage : pagina, nextPage, prevPage})
            } else {
                res.json({message : 'No se encontraron resultados!'})
            }
        } catch (error) {
            res.json({message : 'Algo ha salido mal!'})
        }
    }
    //getEmployeeByID
    static getEmpleadoByID = async (req: Request, res: Response)=>{
        const{id} = req.params;
        const employeeRepo = getRepository(Employee);
        try{
            const employee = await employeeRepo.findOneOrFail({select :[`id`, `apellido`, `nombre`, `codeAccess`,`telefono`,`direccion`,`imagen`, 'role',`estado`], where:{id}});
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
    //create new employee de tipo Admin
    static AgregarEmpleadoA = async(req: Request, res:Response)=>{

        const{apellido, nombre, code, password} = req.body;
        const token = jwt.sign({ codeAccess: req.body.code}, process.env.JWTSECRET, { expiresIn : '1h'});

        const empRepo = getRepository(Employee);
        let employee
        const message = 'Se ha registrado con exito!';
        let verifycationLink;
        let emailStatus = 'Ok';
        const codigo  = 'SYSTEM-PC_ADMIN-' + code;

        //buscar e la base de datos si no existen regiatro con el mismo codigo
        const emailExist = await empRepo.findOne({
            where: {codeAccess: codigo}
        });
        if(emailExist){
            return res.status(400).json({msj:'Ya existe un regitro con el codigo: ' + codigo})
        }
        //el registro es creado si no existe
        employee = new Employee();
        employee.apellido = apellido;
        employee.nombre = nombre;
        employee.codeAccess = codigo;
        employee.password = password;
        employee.role = 'admin';
        employee.confirmacionCode = token;

        //validations
        const ValidateOps = {validationError:{target: false, value: false}};
        const errors = await validate(employee, ValidateOps);

        if (errors.length > 0){
            return res.status(400).json({message : 'Algo salio mal!'});
        }
        //verificar si el token existe
        try{
            verifycationLink = `http://localhost:9000/confirmRegister/${token}`;
    
        }catch(e){
            console.log(e);
        }

        //TODO: HASH PASSWORD
        try{
            employee.hashPassword();
            await empRepo.save(employee);
        }
        catch(e){
            console.log(e);
        }
        //all ok
        res.json({mjs: 'Registro creado con exito', verifycationLink});
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

        res.json({messge:'El registro de ha actualizado'});
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
                        const employee = await employeeRepo.findOneOrFail({select :[`id`, `apellido`, `nombre`, `codeAccess`,`telefono`,`direccion`,`imagen`, 'role',`estado`],
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
    //create new employeeE 
    static AgregarEmpleadoE = async(req: Request, res:Response)=>{

        const{apellido, nombre, code, password} = req.body;

        const codigo = 'SYSTEM-PC-'+ code 

        const empRepo = getRepository(Employee);
        const codeExist = await empRepo.findOne({
            where: {codeAccess: codigo}
        });
        if(codeExist){
            return res.status(400).json({msj:'Ya existe un empleado con el codigo : ' + codigo})
        }
        
        const employee = new Employee();
        employee.apellido = apellido;
        employee.nombre = nombre;
        employee.codeAccess = codigo ;
        employee.password = password;
        employee.role = 'empleado';
        employee.estado = true;

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
            res.status(409).json({message: 'Algo salio mal Intenta nuevamente!'});
        }
        //all ok
        res.json({mjs: 'Empleado se creo con exito'})
    };
}