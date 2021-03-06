import { getRepository } from "typeorm";
import { User } from "../entity/User";
import { Request, Response } from 'express';

class UserController{
    static getUsers = async(req: Request, res: Response, query)=>{

        const take = query.take || 10
        const skip = query.skip || 0
        const keyword = query.keyword || ''
        const userRepo = getRepository(User);
        try{
            const user = await userRepo.createQueryBuilder('user').orderBy('firstName', 'DESC').skip(skip).take(take).getMany()
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