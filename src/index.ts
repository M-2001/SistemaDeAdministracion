import "reflect-metadata";
import { createConnection } from "typeorm";
import * as express from 'express';
import Server from './server/index';
import * as dotenv from 'dotenv';

dotenv.config()
createConnection().then(async () => {
    
    const app = express()
    var port_number = app.listen(process.env.PORT || 3000);
    app.listen(port_number)
    // app.listen(process.env.PORT, () => {
    //     console.log("ready in port: ", process.env.PORT)
    // })
    const server = new Server();
    // server.listen();


}).catch(error => console.log(error));
