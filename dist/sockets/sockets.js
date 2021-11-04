"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nuevo = exports.desconectar = void 0;
//funcion que se encargara de conectar con un cliente
//funcion que se encragara de notificar cuando el cliente se desconecte el servidor
const desconectar = (cliente, _) => {
    cliente.on("disconnect", () => {
        console.log("Server Disconnect!!!");
    });
};
exports.desconectar = desconectar;
const nuevo = (cliente, io) => {
    cliente.on("new", () => {
        console.log("una nueva orden se ah realizado");
        const obj = { message: "Nueva Orden!!!", ok: true };
        io.emit("reload", obj);
    });
};
exports.nuevo = nuevo;
//# sourceMappingURL=sockets.js.map