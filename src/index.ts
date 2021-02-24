import "reflect-metadata";
import {createConnection} from "typeorm";
import * as express from 'express';
import Server from './server/index';
import  * as dotenv from 'dotenv';

createConnection().then(async () => {

    dotenv.config()

    const server = new Server();
    server.listen();


}).catch(error => console.log(error));
