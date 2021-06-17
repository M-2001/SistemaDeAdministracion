import "reflect-metadata";
import { createConnection } from "typeorm";
import Server from './server/index';
import * as dotenv from 'dotenv';

dotenv.config()

const server = new Server();
server.listen();
createConnection().then(async () => {
    console.log('Database Online!!!');
}).catch(error => console.log(error));
