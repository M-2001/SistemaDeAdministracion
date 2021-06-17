"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.desconectar = exports.ConnectClient = void 0;
const Producto_1 = require("../controller/Producto");
const Orden_1 = require("../controller/Orden");
//funcion que se encargara de conectar con un cliente
const ConnectClient = (cliente, io) => {
    const productoController = new Producto_1.default();
    const ordenController = new Orden_1.default();
    setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
        //emitir eventos que el cliente estara escuchando
        productoController.getAllProducts().then(productos => {
            if (productos.length) {
                const obj = { ok: true };
                io.emit('all_products', obj);
            }
            return;
        });
        ordenController.MostrarOrdenes().then(ordenes => {
            if (ordenes.length) {
                const obj = { ok: true };
                io.emit('ordenes', obj);
            }
            return;
        });
    }), 2500);
};
exports.ConnectClient = ConnectClient;
//funcion que se encragara de notificar cuando el cliente se desconecte el servidor
const desconectar = (cliente, io) => {
    cliente.on('disconnect', () => {
        console.log('Server Disconnect!!!');
    });
};
exports.desconectar = desconectar;
//# sourceMappingURL=sockets.js.map