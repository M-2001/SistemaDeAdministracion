"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoleU = void 0;
const typeorm_1 = require("typeorm");
const Cliente_1 = require("../entity/Cliente");
const checkRoleU = (roles) => {
    return async (req, res, next) => {
        const { clienteid } = res.locals.jwtPayload;
        const userRepo = (0, typeorm_1.getRepository)(Cliente_1.Cliente);
        let clt;
        try {
            clt = await userRepo.findOneOrFail(clienteid);
        }
        catch (e) {
            res.status(404).json({ message: "Not Authorized" });
        }
        //check
        const { role } = clt;
        if (roles.includes(role)) {
            next();
        }
        else {
            res.status(404).json({ message: "Not Authorized" });
        }
    };
};
exports.checkRoleU = checkRoleU;
//# sourceMappingURL=roleUser.js.map