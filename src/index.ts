import "reflect-metadata";
import { createConnection } from "typeorm";
import Server from "./server/index";
import * as dotenv from "dotenv";
import * as express from "express";
import * as cors from "cors";

const app = express();
dotenv.config();
const SocketServer = Server.instance;

SocketServer.start(() => {
	app.use(
		cors({
			origin: [
				"https://client-mye-soporte.vercel.app",
				"https://mye-soporte.vercel.app",
			],
			credentials: true,
		})
	);
	console.log("===> Servidor corriendo en puerto: " + SocketServer.port);
	createConnection()
		.then(async (connection) => {
			if (connection) {
				return console.log(
					"===> Conectado a la base de datos con exito!!!"
				);
			}
		})
		.catch((error) =>
			console.log(
				"===> Hubo un error al intentar conectar con la base de datos!"
			)
		);
});
