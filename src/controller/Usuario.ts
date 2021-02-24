import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { Request, Response } from 'express';

class UserController{
    static getUsers = async(req: Request, res: Response)=>{
        const userRepo = getRepository(User);
        try{
            const user = await userRepo.find();
            if(user.length>0){
            res.send(user);
        }
        else{
            res.status(404).json({message:'Not results!'});
            }
        }
        catch(e){
            res.status(404).json({message:'Not results!'});
        }
    };
}
export default UserController;