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
import routesRating from '../router/rating';
import routesOrden from '../router/orden';
import routesOrdenDte from '../router/OrdenDetalle';
import routescarrito from '../router/carrito';
import routesCupon from '../router/cupon';
import routesPay from '../router/pay';
import * as fileUpload from 'express-fileupload';
import * as SocketIO from 'socket.io';

import * as http from 'http';

import * as sockets from '../sockets/sockets'
//const PORT = process.env.PORT || 5000

class Server {
    public static readonly PORT: number = 5000;

    private static _intance: Server;
    private app: express.Application;

    private httpServer: http.Server;

    //encargada de eventos de los sockets
    private io: SocketIO.Server;
    private socketID: any;

    public port: string | number;

    //sirve para iniciar todas las rutas necesarias
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
        pay: '/api/pay-checkout'
    }

    //se encarga de ejecutar todos los metodos que sean llamados
    constructor() {
        this.app = express();
        this.middleware();
        this.routes();
        this.config();
        this.sockets();
        this.conectarCliente();

    }
    private corsOption = ()=>{

    }
    //middlewares necesarios para la aplicacion
    middleware() {

        //this.app.set('view engine', 'ejs')

        //CORS
        this.app.use(cors({ origin: ['https://client-systempc.vercel.app',"https://system-pc.netlify.app"], credentials: true }));

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
        this.app.use(this.routenames.empleado, routesEmpleado)
        this.app.use(this.routenames.cliente, RoutesCliente)
        this.app.use(this.routenames.authEmpleado, authemp)
        this.app.use(this.routenames.authCliente, authclt)
        this.app.use(this.routenames.categoria, routesCtria)
        this.app.use(this.routenames.marca, routesMarca)
        this.app.use(this.routenames.proveedor, routesProveedor)
        this.app.use(this.routenames.producto, routesProd)
        this.app.use(this.routenames.rating, routesRating)
        this.app.use(this.routenames.orden, routesOrden)
        this.app.use(this.routenames.ordenDte, routesOrdenDte)
        this.app.use(this.routenames.carrito, routescarrito)
        this.app.use(this.routenames.cupon, routesCupon)
        this.app.use(this.routenames.pay, routesPay)
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
    private sockets() {
        this.io = new SocketIO.Server(this.httpServer, {
            cors: {
                origin: ['https://client-systempc.vercel.app',"https://system-pc.netlify.app"],
                allowedHeaders: 'Content-Type',
                methods: 'GET, POST',
                credentials: true,
            }
        })
        //require('socket.io')(this.httpServer,{origin:'*',})
    }

    //connectar cliente que escuchar los eventos del servidor
    private conectarCliente(): void {
        this.io.on("connect", cliente => {
            this.socketID = cliente.id;
            console.log('Usuario conectado al servidor con id: ' + this.socketID);
            sockets.desconectar(cliente, this.io)
            sockets.nuevo(cliente, this.io)
        });
    }

    //funcion principal que se encarga de iniciar el servidor
    start(callback: any) {
        this.httpServer.listen(this.port, callback);
    }
}
export default Server;