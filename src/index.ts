import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from 'express';
import Server from './server/index';
import * as dotenv from 'dotenv';

dotenv.config()
const server = new Server();
server.listen();
createConnection().then(async () => {
    console.log("Server is ready")
}).catch(error => console.log(error));
