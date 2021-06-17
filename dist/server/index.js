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
const bodyParser = require("body-parser");
const fileUpload = require("express-fileupload");
const SocketIO = require("socket.io");
const http = require("http");
const sockets = require("../sockets/sockets");
//const PORT = process.env.PORT || 5000
class Server {
    //se encarga de ejecutar todos los metodos que sean llamados
    constructor() {
        //sirve para iniciar todas las rutas necesarias
        this.empleado = { empleado: '/empleado' };
        this.cliente = { cliente: '/user' };
        this.authEmpleado = { auth: '/auth' };
        this.authCliente = { auth: '/authU' };
        this.categoria = { categoria: '/categoria' };
        this.marca = { marca: '/marca' };
        this.proveedor = { proveedor: '/proveedor' };
        this.producto = { producto: '/producto' };
        this.rating = { rating: '/producto-rating' };
        this.orden = { orden: '/orden' };
        this.ordenDte = { ordenDte: '/orden-detalle' };
        this.carrito = { carrito: '/carrito' };
        this.cupon = { cupon: '/cupon' };
        this.pay = { pay: '/pay-checkout' };
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
        this.app.use(cors({ origin: 'http://localhost:3000', credentials: true }));
        //fileupload
        this.app.use(fileUpload());
        //Lectura del body
        this.app.use(express.json());
        //Parseo de body
        this.app.use(bodyParser.urlencoded({ extended: true }));
        //this.app.get('/', (req, res) => res.render('index'));
    }
    //Declaracion de rutas de la aplicacion
    routes() {
        this.app.use(this.empleado.empleado, empleado_1.default);
        this.app.use(this.cliente.cliente, cliente_1.default);
        this.app.use(this.authEmpleado.auth, authempleado_1.default);
        this.app.use(this.authCliente.auth, authCliente_1.default);
        this.app.use(this.categoria.categoria, categoria_1.default);
        this.app.use(this.marca.marca, marca_1.default);
        this.app.use(this.proveedor.proveedor, proveedor_1.default);
        this.app.use(this.producto.producto, producto_1.default);
        this.app.use(this.rating.rating, rating_1.default);
        this.app.use(this.orden.orden, orden_1.default);
        this.app.use(this.ordenDte.ordenDte, OrdenDetalle_1.default);
        this.app.use(this.carrito.carrito, carrito_1.default);
        this.app.use(this.cupon.cupon, cupon_1.default);
        this.app.use(this.pay.pay, pay_1.default);
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
                origin: ['http://localhost:3000'],
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
            sockets.ConnectClient(cliente, this.io);
            sockets.desconectar(cliente, this.io);
        });
    }
    //funcion principal que se encarga de iniciar el servidor
    start(callback) {
        this.httpServer.listen(this.port, callback);
    }
}
Server.PORT = 5000;
exports.default = Server;
//# sourceMappingURL=index.js.map