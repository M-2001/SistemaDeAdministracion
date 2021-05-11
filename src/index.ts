import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from 'express';
import Server from './server/index';
import * as dotenv from 'dotenv';

createConnection().then(async () => {
    const app = express()
    dotenv.config()
    app.listen(process.env.PORT, () => {
        console.log("ready in port: ", process.env.PORT)
    })
    const server = new Server();
    server.listen();


}).catch(error => console.log(error));
