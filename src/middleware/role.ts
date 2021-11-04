import { Request, Response, NextFunction } from "express";
import { getRepository } from "typeorm";
import { Employee } from "../entity/Employee";

export const checkRole = (roles: Array<string>) => {
	return async (req: Request, res: Response, next: NextFunction) => {
		const { id } = res.locals.jwtPayload;
		const userRepo = getRepository(Employee);
		let emp: Employee;
		try {
			emp = await userRepo.findOneOrFail(id);
		} catch (e) {
			res.status(404).json({ message: "Not Authorized" });
		}
		//check
		const { role } = emp;
		if (roles.includes(role)) {
			next();
		} else {
			res.status(404).json({ message: "Not Authorized" });
		}
	};
};
