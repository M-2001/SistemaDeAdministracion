import { Application } from "express";
import * as express from 'express';
import cors = require('cors');
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
import routesOrden from '../router/orden';
import routesOrdenDte from '../router/OrdenDetalle';

import routescarrito from '../router/carrito';
import routesCupon from '../router/cupon';
import * as fileUpload from 'express-fileupload'

class Server {
    private routenames = {
        empleado: '/api/empleado',
        cliente: '/api/user',
        authEmpleado: '/api/auth',
        authCliente: '/api/authU',
        categoria: '/api/categoria',
        marca: '/api/marca',
        proveedor: '/api/proveedor',
        producto: '/api/producto',
        usuario: '/api/usuario',
        rating: '/api/producto-rating',
        orden: '/api/orden',
        ordenDte: '/api/orden-detalle',
        carrito: '/api/carrito',
        cupon: '/api/cupon'
    }
    private app: Application;
    private port: string;


    //se encarga de ejecutar todos los metodos que sean llamados
    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3000';
        this.middleware();
        this.routes();

    }
    //funcion principal para levantar un servido en el puerto especificado
    listen() {
        this.app.listen(this.port, () => {
            console.log(`Server is running in http://localhost:${this.port}`);
        });
    }
    //middlewares necesarios para la aplicacion
    middleware() {

        //fileupload
        this.app.use(fileUpload());

        //CORS
        this.app.use(cors());

        //Lectura del body
        this.app.use(express.json());

        //Parseo de body
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(express.static('src'))

    }
    //Declaracion de rutas de la aplicacion
    routes() {
        this.app.use(this.routenames.authEmpleado, routesEmpleado)
        this.app.use(this.routenames.cliente, RoutesCliente)
        this.app.use(this.routenames.authEmpleado, authemp)
        this.app.use(this.routenames.authCliente, authclt)
        this.app.use(this.routenames.categoria, routesCtria)
        this.app.use(this.routenames.marca, routesMarca)
        this.app.use(this.routenames.proveedor, routesProveedor)
        this.app.use(this.routenames.producto, routesProd)
        this.app.use(this.routenames.usuario, routesUsuario)
        this.app.use(this.routenames.rating, routesRating)
        this.app.use(this.routenames.orden, routesOrden)
        this.app.use(this.routenames.ordenDte, routesOrdenDte)
        this.app.use(this.routenames.carrito, routescarrito)
        this.app.use(this.routenames.cupon, routesCupon)
    }
}
export default Server;