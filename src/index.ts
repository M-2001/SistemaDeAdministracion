import "reflect-metadata";
import {createConnection} from "typeorm";
import Server from './server/index';
import  * as dotenv from 'dotenv';

dotenv.config()

    const server = new Server();
    server.listen();
createConnection(//{
//     type: "mysql",
//     host: "remotemysql.com",
//     port: 3306,
//     username: "wevbdYXWC1",
//     password: "Ht7TqGGjPl",
//     database: "wevbdYXWC1",
//     synchronize: true,
//     logging: true,

//     entities: [
//         "dist/entity/**/*.js",
//     ],
//         migrations: [
//         "dist/migration/**/*.js"
//     ],
//         subscribers: [
//         "dist/subscriber/**/*.js"
//     ],
//         cli: {
//         "entitiesDir": "dist/entity",
//         "migrationsDir": "dist/migration",
//         "subscribersDir": "dist/subscriber"
//     }
// }
).then(async () => {
    console.log('Database Online!!!');
}).catch(error => console.log(error));
