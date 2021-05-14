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

class Server{
    private app : Application;
    private PORT : string;
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
        this.PORT = process.env.PORT, '0.0.0.0' ;
        this.middleware();
        this.routes();
        
    }
    //funcion principal para levantar un servido en el puerto especificado
    listen(){
        this.app.listen(this.PORT,() =>{
            console.log(`Server is running in http://localhost:${this.PORT}`);
        });
    }
    //middlewares necesarios para la aplicacion
    middleware(){

        //this.app.set('view engine', 'ejs')

        //fileupload
        this.app.use(fileUpload());

        //CORS
        this.app.use(cors());

        //Lectura del body
        this.app.use(express.json());

        //Parseo de body
        this.app.use(bodyParser.urlencoded({extended:true}))

        this.app.use('/', express.static(path.join(__dirname, '../views')))

        this.app.get('/', (req, res)=> res.redirect('../views/index.html'))
        
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
}
export default Server;