"use strict";
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
    app.use(cors({ origin: ['https://client-systempc.vercel.app', "https://system-pc.netlify.app", 'https://admin-system-pc.vercel.app/'], credentials: true }));
    console.log('===> Servidor corriendo en puerto: ' + SocketServer.port);
    typeorm_1.createConnection().then(async (connection) => {
        if (connection) {
            return console.log('===> Conectado a la base de datos con exito!!!');
        }
    }).catch(error => console.log('===> Hubo un error al intentar conectar con la base de datos!'));
});
//# sourceMappingURL=index.js.map