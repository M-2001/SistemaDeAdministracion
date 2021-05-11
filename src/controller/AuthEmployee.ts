import { getRepository } from "typeorm";
import { Employee } from '../entity/Employee';
import { Request, Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { validate } from "class-validator";
import { transporter } from "../middleware/mailer";

class AuthEmployeeController{
    
    static Login = async(req: Request, res: Response)=>{
        const{code, password}= req.body;
        if(!(code && password)){
            return res.status(400).json({message:'code & password are required'});
        }
        const empRepository = getRepository(Employee);
        let emp : Employee;
        try{
            emp = await empRepository.findOneOrFail({where:{codeAccess : code}});
        }
        catch(e){
            return res.send({message:'Code or password incorrect!',ok:false})
        }
        //check password
        if (!emp.checkPassword(password)){
            return res.send({message:'Code or password incorrect',ok:false});
        }

        // if(emp.estado == false){
        //     res.json({ok : false, message :'Access denied'});
        // }   
        else{
            const token =  jwt.sign({id: emp.id, code: emp.codeAccess,role:emp.role}, process.env.JWTSECRET,{
            expiresIn : '48h'
        }); 
        res.json({message:'Ok', token : token,ok:true/*refreshToken,*/});
        }
        //const refreshToken = jwt.sign({id: emp.id,username:emp.email}, config.jwtSecretRefresh,{expiresIn : '48h'});

        // user.refreshToken = refreshToken;
        // try {
        //     await empRepository.save(emp);
        // } catch (error) {
        //     return res.status(400).json({message: 'somthing goes wrong!'})
        // }
    };

    static passwordChange = async(req : Request, res :Response)=>{
        const {id} = res.locals.jwtPayload;
        const{oldPassword, newPassword}= req.body;
        if(!(oldPassword && newPassword)){
            res.status(400).json({message: 'Contraseña antigua y nueva son requeridas!'});
        }
        const emplRepo = getRepository(Employee);
        let empl : Employee;
        try{
            empl = await emplRepo.findOneOrFail(id)
        }
        catch(e){
            res.status(400).json({message:'Algo salio mal! '});
        }
        if (!empl.checkPassword(oldPassword)){
            return res.status(400).json({message:'Varifica tu contraseña antigua! '});
        }
        empl.password = newPassword;
        const validateOps = {validationError:{target:false, value: false}};
        const error= await validate(empl, validateOps);
        if (error.length>0){
            res.status(400).json(error)
        }
        //hash password
        empl.hashPassword();
        emplRepo.save(empl);
        res.json({message:'Contraseña cambiada con exito! '});
    };

    //ForgotPassword
    static forgotPassword = async(req: Request, res: Response)=>{
        const {code} = req.body;
        if(!(code)){
            return res.status(400).json({message: 'Code es requerido para cambiar password'});
        }
        const message = 'check your email for a link to reset your password.';
        let verifycationLink;
        let emailStatus = 'Ok';

        const emplRespo = getRepository(Employee);
        let empl : Employee;

        try{
            empl = await emplRespo.findOneOrFail({where:{codeAccess : code}});
            const token = jwt.sign({id: empl.id, code: empl.codeAccess}, process.env.JWTSECRETRESET, {expiresIn: '30m'});
            verifycationLink = `http://localhost:9000/new-password/${token}`;
            empl.resetPassword = token;

        }catch(e){
            return res.json({message});
        }
        //TODO: sendEmail
        //try{
                // await transporter.sendMail({
                // from : '"Forgot Password " <castlem791@gmail.com>',//sender address
                // to: empl.email,
                // subject: "Forgot Password",
                //html: '<b>Please check on the following link , or paste this into your browser to complete the process:</b>
                //<a href="${verifycationLink}">${verifycationLink}</a>',
            //});
        // }catch(error){
        //     emailStatus = error;
        //     return res.status(401).json({message:'Something goes wrong!'});
        // }
        try{
            await emplRespo.save(empl);
        }catch(error){
            emailStatus = error;
            return res.status(400).json({message:'Something goes wrong!'})
        }
        res.json({message, info: emailStatus, verifycationLink});
    };

    //resetPassword
    static createNewPassword = async(req: Request, res: Response)=>{
        const {newPassword} = req.body;
        const resetPassword = req.headers.reset as string;
        if(!(resetPassword && newPassword)){
            res.status(400).json({message:'all the fields are require'});
        }
        const emplRepo = getRepository(Employee);
        let jwtPayload;
        let empl: Employee;
        try{
            jwtPayload = jwt.verify(resetPassword, process.env.JWTSECRETRESET);
            empl = await emplRepo.findOneOrFail({where: {resetPassword}});

        }catch(error){
            return res.status(401).json({message: 'error'})
        }
        empl.password = newPassword;

        const validationsOps = {validationError:{target: false, value: false}};
        const errors = await validate(empl, validationsOps);

        if(errors.length > 0){
            return res.status(400).json({error:errors})
        }
        try{
            empl.hashPassword();
            await emplRepo.save(empl);
            
        }catch(error){
            return res.status(400).json({message:error});
        }
        res.json({message:'password changed!'})
    }

    //activar cuenta administrador
    static ActivarCuenta = async(req: Request, res: Response)=>{
        const confirmacionCode = req.headers.confirm as string;
        if(!(confirmacionCode)){
            res.status(400).json({message:'all the fields are require'});
        }
        const emplRepo = getRepository(Employee);
        let employee : Employee;
        try{
            employee = await emplRepo.findOneOrFail({where: {confirmacionCode}});

        }catch(error){
            return res.status(401).json({message: 'error'})
        }

        const validationsOps = {validationError:{target: false, value: false}};
        const errors = await validate(employee, validationsOps);

        if(errors.length > 0){
            return res.status(400).json({error:errors})
        }
        try{
            employee.estado = true
            await emplRepo.save(employee);
            
        }catch(error){
            return res.status(400).json({message: error});
        }
        res.json({message:'Registro Activado!'})
    };
    static addNewPassword = async (req: Request, res: Response)=>{
        const id = req.params
        const { password } = req.body
        let employee:Employee;
        const emplRepo = getRepository(Employee);
        try {
            employee = await emplRepo.findOneOrFail(id)
            if(employee){
                employee.password = password
                employee.hashPassword()
                await emplRepo.save(employee)
                return res.send({message:"Se guardo la contraseña",ok:true})
            }
        } catch (error) {
            return res.status(400).json({ message: error });
        }

    }
}
export default AuthEmployeeController;