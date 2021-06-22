import { Socket } from 'socket.io';
import * as socketIO from 'socket.io';
import ProductoController from '../controller/Producto';
import OrdenController from '../controller/Orden';

//funcion que se encargara de conectar con un cliente
export const ConnectClient = (_: Socket, io: socketIO.Server)=>{
    const productoController = new ProductoController();
    const ordenController = new OrdenController();

    setInterval(async () => {
        //emitir eventos que el cliente estara escuchando
        productoController.getAllProducts().then(productos =>{
            if(productos.length){
                const obj = {ok : true}
                io.emit('all_products', obj);
            }
            return;
        });

        ordenController.MostrarOrdenes().then(ordenes =>{
            if (ordenes.length) {
                const obj = {ok : true}
                io.emit('ordenes', obj);
            }
            return;
        });
    },3500 );
}

//funcion que se encragara de notificar cuando el cliente se desconecte el servidor
export const desconectar = (cliente: Socket, _: socketIO.Server)=>{
        cliente.on('disconnect', ()=>{
            console.log('Server Disconnect!!!');
        });
}

