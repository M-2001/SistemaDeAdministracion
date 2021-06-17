"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkRoleU = void 0;
const typeorm_1 = require("typeorm");
const Cliente_1 = require("../entity/Cliente");
const checkRoleU = (roles) => {
    return (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
        const { clienteid } = res.locals.jwtPayload;
        const userRepo = typeorm_1.getRepository(Cliente_1.Cliente);
        let clt;
        try {
            clt = yield userRepo.findOneOrFail(clienteid);
        }
        catch (e) {
            res.status(404).json({ message: 'Not Authorized' });
        }
        //check
        const { role } = clt;
        if (roles.includes(role)) {
            next();
        }
        else {
            res.status(404).json({ message: 'Not Authorized' });
        }
    });
};
exports.checkRoleU = checkRoleU;
//# sourceMappingURL=roleUser.js.map