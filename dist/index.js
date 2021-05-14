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
require("reflect-metadata");
const typeorm_1 = require("typeorm");
const index_1 = require("./server/index");
const dotenv = require("dotenv");
dotenv.config();
const server = new index_1.default();
server.listen();
typeorm_1.createConnection().then(() => __awaiter(void 0, void 0, void 0, function* () {
    console.log('Database Online!!!');
})).catch(error => console.log(error));
//# sourceMappingURL=index.js.map