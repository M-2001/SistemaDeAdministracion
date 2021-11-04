"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const cors = require("cors");
const empleado_1 = require("../router/empleado");
const cliente_1 = require("../router/cliente");
const authempleado_1 = require("../router/authempleado");
const authCliente_1 = require("../router/authCliente");
const categoria_1 = require("../router/categoria");
const marca_1 = require("../router/marca");
const producto_1 = require("../router/producto");
const proveedor_1 = require("../router/proveedor");
const rating_1 = require("../router/rating");
const orden_1 = require("../router/orden");
const OrdenDetalle_1 = require("../router/OrdenDetalle");
const carrito_1 = require("../router/carrito");
const cupon_1 = require("../router/cupon");
const pay_1 = require("../router/pay");
const gallery_router_1 = require("../router/gallery.router");
const fileUpload = require("express-fileupload");
const SocketIO = require("socket.io");
const http = require("http");
const sockets = require("../sockets/sockets");
//const PORT = process.env.PORT || 5000
class Server {
    //se encarga de ejecutar todos los metodos que sean llamados
    constructor() {
        //sirve para iniciar todas las rutas necesarias
        this.routenames = {
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
            pay: '/api/pay-checkout',
            gallery: '/api/gallery',
        };
        this.corsOption = () => {
        };
        this.app = express();
        this.middleware();
        this.routes();
        this.config();
        this.sockets();
        this.conectarCliente();
    }
    //middlewares necesarios para la aplicacion
    middleware() {
        //this.app.set('view engine', 'ejs')
        //CORS
        this.app.use(cors({ origin: ['https://client-mye-soporte.vercel.app', 'https://mye-soporte.vercel.app'], credentials: true }));
        //fileupload
        this.app.use(fileUpload());
        //Lectura del body
        this.app.use(express.json());
        //Parseo de body
        this.app.use(express.urlencoded({ extended: true }));
        //this.app.get('/', (req, res) => res.render('index'));
    }
    //Declaracion de rutas de la aplicacion
    routes() {
        this.app.use(this.routenames.empleado, empleado_1.default);
        this.app.use(this.routenames.cliente, cliente_1.default);
        this.app.use(this.routenames.authEmpleado, authempleado_1.default);
        this.app.use(this.routenames.authCliente, authCliente_1.default);
        this.app.use(this.routenames.categoria, categoria_1.default);
        this.app.use(this.routenames.marca, marca_1.default);
        this.app.use(this.routenames.proveedor, proveedor_1.default);
        this.app.use(this.routenames.producto, producto_1.default);
        this.app.use(this.routenames.rating, rating_1.default);
        this.app.use(this.routenames.orden, orden_1.default);
        this.app.use(this.routenames.ordenDte, OrdenDetalle_1.default);
        this.app.use(this.routenames.carrito, carrito_1.default);
        this.app.use(this.routenames.cupon, cupon_1.default);
        this.app.use(this.routenames.pay, pay_1.default);
        this.app.use(this.routenames.gallery, gallery_router_1.default);
    }
    //servira para crear una nueva instancia del servidor
    static get instance() {
        return this._intance || (this._intance = new this());
    }
    //configuracion del puerto en cual correra la aplicaccion
    config() {
        this.port = process.env.PORT || Server.PORT;
        this.httpServer = new http.Server(this.app);
    }
    //configuracion para conectar con los sockets
    sockets() {
        this.io = new SocketIO.Server(this.httpServer, {
            cors: {
                origin: ['https://client-mye-soporte.vercel.app', 'https://mye-soporte.vercel.app'],
                allowedHeaders: 'Content-Type',
                methods: 'GET, POST',
                credentials: true,
            }
        });
        //require('socket.io')(this.httpServer,{origin:'*',})
    }
    //connectar cliente que escuchar los eventos del servidor
    conectarCliente() {
        this.io.on("connect", cliente => {
            this.socketID = cliente.id;
            console.log('Usuario conectado al servidor con id: ' + this.socketID);
            sockets.desconectar(cliente, this.io);
            sockets.nuevo(cliente, this.io);
        });
    }
    //funcion principal que se encarga de iniciar el servidor
    start(callback) {
        this.httpServer.listen(this.port, callback);
    }
}
Server.PORT = process.env.PORT;
exports.default = Server;
//# sourceMappingURL=index.js.map