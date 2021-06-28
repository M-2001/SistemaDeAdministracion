import { Socket } from 'socket.io';
import * as socketIO from 'socket.io';
import ProductoController from '../controller/Producto';
import OrdenController from '../controller/Orden';

//funcion que se encargara de conectar con un cliente
//funcion que se encragara de notificar cuando el cliente se desconecte el servidor
export const desconectar = (cliente: Socket, _: socketIO.Server) => {
    cliente.on('disconnect', () => {
        console.log('Server Disconnect!!!');
    });
}

export const nuevo = (cliente: Socket, io: socketIO.Server) => {
    cliente.on('new', () => {
        console.log('una nueva orden se ah realizado');
        const obj = {message:"Nueva Orden!!!", ok :true}
        io.emit("reload", obj)
    });
}