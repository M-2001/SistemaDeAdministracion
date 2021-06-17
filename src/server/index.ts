import { Application, Response } from 'express';
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
import routesRating from '../router/rating';
import routesOrden from '../router/orden';
import routesOrdenDte from '../router/OrdenDetalle';
import routescarrito from '../router/carrito';
import routesCupon from '../router/cupon';
import routesPay from '../router/pay';
import * as bodyParser from "body-parser";
import * as fileUpload from 'express-fileupload';
import * as SocketIO from 'socket.io';

import * as http from 'http';

import * as sockets from '../sockets/sockets'

import { ConnectClient } from '../sockets/sockets';
import  ejs = require('ejs');
import ProductoController from "../controller/Producto";
//const PORT = process.env.PORT || 5000

class Server{
    public static readonly PORT: number = 5000;

    private static _intance : Server;
    private app : express.Application;

    private httpServer : http.Server;

    //encargada de eventos de los sockets
    private io : SocketIO.Server;
    private socketID: any;
    
    public port: string | number;
    
    //sirve para iniciar todas las rutas necesarias
    private empleado = { empleado: '/empleado'}
    private cliente = {cliente: '/user'}
    private authEmpleado = {auth: '/auth'}
    private authCliente = {auth: '/authU'}
    private categoria = { categoria : '/categoria'}
    private marca = { marca :'/marca'}
    private proveedor = { proveedor : '/proveedor'}
    private producto = { producto : '/producto'}
    private rating = { rating : '/producto-rating'}
    private orden = { orden : '/orden'}
    private ordenDte = {ordenDte : '/orden-detalle'}
    private carrito = {carrito : '/carrito'}
    private cupon = {cupon : '/cupon'}
    private pay = {pay:'/pay-checkout'}

    //se encarga de ejecutar todos los metodos que sean llamados
    constructor(){
        this.app = express();
        this.middleware();
        this.routes();
        this.config();
        this.sockets();
        this.conectarCliente();
        
    }
    //middlewares necesarios para la aplicacion
    middleware(){

        //this.app.set('view engine', 'ejs')

        //CORS
        this.app.use(cors({origin:'http://localhost:3000', credentials: true}));

        //fileupload
        this.app.use(fileUpload());

        //Lectura del body
        this.app.use(express.json());

        //Parseo de body
        this.app.use(bodyParser.urlencoded({extended:true}));

        //this.app.get('/', (req, res) => res.render('index'));
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
        this.app.use(this.rating.rating, routesRating)
        this.app.use(this.orden.orden , routesOrden)
        this.app.use(this.ordenDte.ordenDte, routesOrdenDte)
        this.app.use(this.carrito.carrito, routescarrito)
        this.app.use(this.cupon.cupon, routesCupon)
        this.app.use(this.pay.pay, routesPay)
    }

    //servira para crear una nueva instancia del servidor
    public static get instance() {
        return this._intance || (this._intance = new this())
    }

    //configuracion del puerto en cual correra la aplicaccion
    private config(): void {
        this.port = process.env.PORT || Server.PORT;
        this.httpServer = new http.Server(this.app);
    }

    //configuracion para conectar con los sockets
    private sockets (){
        this.io = new SocketIO.Server(this.httpServer, {
            cors:{
                origin:['http://localhost:3000'],
                allowedHeaders:'Content-Type',
                methods: 'GET, POST',
                credentials: true,
            }
        })
        //require('socket.io')(this.httpServer,{origin:'*',})
    }

    //connectar cliente que escuchar los eventos del servidor
    private conectarCliente(): void {
        this.io.on("connect", cliente  => {
            this.socketID = cliente.id;

            console.log('Usuario conectado al servidor con id: ' + this.socketID);

            sockets.ConnectClient(cliente, this.io);
            sockets.desconectar(cliente, this.io)
        });
    }

    //funcion principal que se encarga de iniciar el servidor
    start(callback: any) {
        this.httpServer.listen(this.port, callback);
    }
}
export default Server;