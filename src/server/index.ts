import { Application } from "express";
import * as express from 'express';
import cors = require ('cors');
import routesEmpleado from '../router/empleado';
import RoutesCliente from '../router/cliente';
import authemp from '../router/authempleado';
import authclt from '../router/authCliente';
import * as bodyParser from "body-parser";
import * as fileUpload from 'express-fileupload'

class Server{
    private app : Application;
    private port : string;
    private empleado = { empleado: '/empleado'}
    private cliente = {cliente: '/user'}
    private authEmpleado = {auth: '/auth'}
    private authCliente = {auth: '/authU'}


    //se encarga de ejecutar todos los metodos que sean llamados
    constructor(){
        this.app = express();
        this.port = process.env.PORT || '3000';
        this.middleware();
        this.routes();
        
    }
    //funcion principal para levantar un servido en el puerto especificado
    listen(){
        this.app.listen(this.port,()=>{
            console.log(`Server is running in http://localhost:${this.port}`);
        });
    }
    //middlewares necesarios para la aplicacion
    middleware(){

        //fileupload
        this.app.use(fileUpload());

        //CORS
        this.app.use(cors());

        //Lectura del body
        this.app.use(express.json());

        //Parseo de body
        this.app.use(bodyParser.urlencoded({extended:true}))

    }

    //Declaracion de rutas de la aplicacion
    routes(){
        this.app.use(this.empleado.empleado, routesEmpleado)
        this.app.use(this.cliente.cliente, RoutesCliente)
        this.app.use(this.authEmpleado.auth, authemp)
        this.app.use(this.authCliente.auth, authclt)
    }
}
export default Server;