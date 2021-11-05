"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRole = void 0;
const typeorm_1 = require("typeorm");
const Employee_1 = require("../entity/Employee");
const checkRole = (roles) => {
    return async (req, res, next) => {
        const { id } = res.locals.jwtPayload;
        const userRepo = (0, typeorm_1.getRepository)(Employee_1.Employee);
        let emp;
        try {
            emp = await userRepo.findOneOrFail(id);
        }
        catch (e) {
            res.status(404).json({ message: "Not Authorized" });
        }
        //check
        const { role } = emp;
        if (roles.includes(role)) {
            next();
        }
        else {
            res.status(404).json({ message: "Not Authorized" });
        }
    };
};
exports.checkRole = checkRole;
//# sourceMappingURL=role.js.map