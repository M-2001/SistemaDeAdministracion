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
import routesCart from '../router/carrito'; 
import * as fileUpload from 'express-fileupload'

class Server {
    private app: Application;
    private port: string;
    private routes_name = {
        carrito: '/cart',
        empleado: '/empleado',
        cliente: '/user',
        authE: '/auth',
        authC: '/authU',
        categoria: '/categoria',
        marca: '/marca',
        proveedor: '/proveedor',
        producto: '/producto',
        usuario: '/usuario',
        rating: '/producto-rating',
        orden: '/orden',
        ordenDte: '/orden-detalle',
    }

    //se encarga de ejecutar todos los metodos que sean llamados
    constructor() {
        this.app = express();
        this.port = process.env.PORT || '3001';
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

    }
    //Declaracion de rutas de la aplicacion
    routes() {
        this.app.use(this.routes_name.empleado, routesEmpleado)
        this.app.use(this.routes_name.cliente, RoutesCliente)
        this.app.use(this.routes_name.authE, authemp)
        this.app.use(this.routes_name.authC, authclt)
        this.app.use(this.routes_name.categoria, routesCtria)
        this.app.use(this.routes_name.marca, routesMarca)
        this.app.use(this.routes_name.proveedor, routesProveedor)
        this.app.use(this.routes_name.producto, routesProd)
        this.app.use(this.routes_name.usuario, routesUsuario)
        this.app.use(this.routes_name.rating, routesRating)
        this.app.use(this.routes_name.orden, routesOrden)
        this.app.use(this.routes_name.ordenDte, routesOrdenDte)
        this.app.use(this.routes_name.carrito,routesCart)
    }
}
export default Server;