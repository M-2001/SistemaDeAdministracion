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
import routesPay from '../router/pay';
import * as bodyParser from "body-parser";
import * as fileUpload from 'express-fileupload'
import * as path from 'path';
import  ejs = require('ejs')

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
        cupon: '/api/cupon',
        pay:'/api/pay-checkout'
    }
    private app: Application;
    private port: string;

    //se encarga de ejecutar todos los metodos que sean llamados
    constructor() {
        this.app = express();
        this.port = process.env.PORT;
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

        //this.app.set('view engine', 'ejs')

        //fileupload
        this.app.use(fileUpload());

        //CORS
        // this.app.use(cors());

        //Lectura del body
        this.app.use(express.json());

        //Parseo de body
        this.app.use(express.urlencoded({ extended: true }))
        this.app.use(express.static('src'))

        this.app.use('/', express.static(path.join(__dirname, '../views')))

        this.app.get('/', (req, res)=> res.redirect('../views/index.html'))
        
        //this.app.get('/', (req, res) => res.render('index'));
    

    }
    //Declaracion de rutas de la aplicacion
    routes() {
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
        this.app.use(this.routenames.pay,routesPay)
        this.app.use(this.routenames.empleado,routesEmpleado)
    }
}
export default Server;