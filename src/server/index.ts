import { Application } from "express";
import * as express from 'express';
import cors = require ('cors');
import routesEmpleado from '../router/empleado';
import RoutesCliente from '../router/cliente';
import authemp from '../router/authempleado';
import authclt from '../router/authCliente';
import routesCtria from '../router/categoria';
import routesMarca from '../router/marca';
import routesProd from '../router/producto';
import routesProveedor from '../router/proveedor';
import routesUsuario from '../router/user';
import routesRating from '../router/rating';
import * as bodyParser from "body-parser";
import * as fileUpload from 'express-fileupload'

class Server{
    private app : Application;
    private port : string;
    private empleado = { empleado: '/empleado'}
    private cliente = {cliente: '/user'}
    private authEmpleado = {auth: '/auth'}
    private authCliente = {auth: '/authU'}
    private categoria = { categoria : '/categoria'}
    private marca = { marca :'/marca'}
    private proveedor = { proveedor : '/proveedor'}
    private producto = { producto : '/producto'}
    private usuario = { usuario : '/usuario'}
    private rating = { rating : '/producto-rating'}


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
        this.app.use(this.categoria.categoria, routesCtria)
        this.app.use(this.marca.marca, routesMarca)
        this.app.use(this.proveedor.proveedor, routesProveedor)
        this.app.use(this.producto.producto, routesProd)
        this.app.use(this.usuario.usuario, routesUsuario)
        this.app.use(this.rating.rating, routesRating)
    }
}
export default Server;