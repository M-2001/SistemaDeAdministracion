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
const typeorm_1 = require("typeorm");
const Cupones_1 = require("../entity/Cupones");
const Cliente_1 = require("../entity/Cliente");
const nodemailer_config_1 = require("../config/nodemailer.config");
class CuponController {
}
//crear cupon de descuento
CuponController.CrearCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let newCupon;
    try {
        const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
        let date = new Date();
        let month = date.getMonth() + 1;
        const codigoCupon = Math.floor(Math.random() * 90000) + 10000;
        const codigo = 'SYSTEM_PC-' + codigoCupon + month;
        const { descuento } = req.body;
        const cupon = new Cupones_1.Cupon();
        cupon.codigo = codigo,
            cupon.descuento = descuento,
            newCupon = yield cuponRepo.save(cupon);
        //all is ok
        res.json({ ok: true, message: 'Cupon Creado con exito', newCupon });
        console.log(newCupon);
    }
    catch (error) {
        console.log(error);
    }
});
CuponController.EstadoCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cupon;
    const id = req.body;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = yield cuponRepo.findOneOrFail(id);
        if (cupon.status == true) {
            cupon.status = false;
        }
        else {
            cupon.status = true;
        }
        const cuponStatus = yield cuponRepo.save(cupon);
        res.json({ ok: true, cupon: cuponStatus.status });
    }
    catch (error) {
        console.log(error);
    }
});
CuponController.MostrarCupones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cupon;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = yield cuponRepo.findAndCount();
        if (cupon.length > 0) {
            res.json({ ok: true, cupon });
        }
        else {
            res.json({ message: ' No se encontraron resultados' });
        }
    }
    catch (error) {
        console.log(error);
    }
});
//mostrar cupones Pajinados
CuponController.MostrarCuponesPaginados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
        const [cupones, totalItems] = yield cuponRepo.findAndCount({ take, skip: (pagina - 1) * take });
        if (cupones.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, cupones, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
//eliminar Cupon
CuponController.EliminarCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cupon;
    const { id } = req.body;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = yield cuponRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        yield cuponRepo.remove(cupon);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Cupon ha sido eliminado!' });
});
//enviar Cupon
CuponController.SendCupon = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    const email = req.body.email;
    let CODIGO_CUPON = req.query.CODIGO_CUPON;
    let cuponExist;
    let cliente;
    //bus
    try {
        if (CODIGO_CUPON) {
            try {
                cuponExist = yield cuponRepo.findOneOrFail({ where: { codigo: CODIGO_CUPON } });
                if (cuponExist.status == true) {
                    return res.status(400).json({ message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!' });
                }
                else {
                    try {
                        cliente = yield clienteRepo.findOne({ where: { email } });
                        if (!cliente) {
                            return res.status(400).json({ messge: 'El cliente con el email: ' + email + ' no existe!!!' });
                        }
                    }
                    catch (error) {
                        console.log(error);
                    }
                    //Try send email 
                    try {
                        let subject = ` ${cliente.nombre + " " + cliente.apellido + " , Por ser cliente especial !!!"} `;
                        yield nodemailer_config_1.transporter.sendMail({
                            from: `"System-PC Sonsonate" <castlem791@gmail.com>`,
                            to: cliente.email,
                            subject: subject,
                            html: ` <!DOCTYPE html>
                                <html lang="en">
                                <head> </head>
                                <body><div>
                                <h3>Felicidades !!! Por ser cliente especial te regalamos un cupon de descuento en el total de tu compra</h3>
                                <p>Aplica tu cupón con un %${cuponExist.descuento} de descuento en tu compra total!!! </p>
                                <p>Codigo Cupon: ${cuponExist.codigo}</p>
                                <p>${cliente.nombre + " " + cliente.apellido}, este Cupón solo es valido para ti, si lo compartes ya no sera valido</p>
                                
                                <a href="${"Link tienda"}">Visitanos pronto !!!</a>
                                </div>
                                </body>
                                </html>`
                        });
                        res.json({ message: "Email enviado con exito!!!" });
                    }
                    catch (error) {
                        console.log('Algo salio mal al enviar email!!!');
                    }
                    console.log('vamos bien loco');
                }
            }
            catch (error) {
                return res.status(400).json({ message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' no es valido!!!' });
            }
        }
        else {
            return res.status(405).json({ message: 'Debe enviar un codigo de cupon!!!' });
        }
    }
    catch (error) {
        console.log(error);
    }
});
exports.default = CuponController;
//# sourceMappingURL=Cupon.js.map