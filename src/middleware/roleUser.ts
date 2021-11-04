import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Employee } from "../entity/Employee";
import { Cliente } from "../entity/Cliente";

export const checkRoleU = (roles: Array<string>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const { clienteid } = res.locals.jwtPayload;
		const userRepo = getRepository(Cliente);
		let clt: Cliente;
		try {
			clt = await userRepo.findOneOrFail(clienteid);
		} catch (e) {
			res.status(404).json({ message: "Not Authorized" });
		}
		//check
		const { role } = clt;
		if (roles.includes(role)) {
			next();
		} else {
			res.status(404).json({ message: "Not Authorized" });
		}
	};
};
