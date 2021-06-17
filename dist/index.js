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
const express = require("express");
const cors = require("cors");
const app = express();
dotenv.config();
const SocketServer = index_1.default.instance;
SocketServer.start(() => {
    app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
    console.log('Servidor corriendo en puerto: ' + SocketServer.port);
    typeorm_1.createConnection().then((connection) => __awaiter(void 0, void 0, void 0, function* () {
        if (connection) {
            return console.log('Conectado a la base de datos con exito!!!');
        }
    })).catch(error => console.log(error));
});
//# sourceMappingURL=index.js.map