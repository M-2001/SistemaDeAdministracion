"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Cupones_1 = require("../entity/Cupones");
const Cliente_1 = require("../entity/Cliente");
const nodemailer_config_1 = require("../config/nodemailer.config");
class CuponController {
}
//crear cupon de descuento
CuponController.CrearCupon = async (req, res) => {
    let newCupon;
    try {
        const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
        let date = new Date();
        let month = date.getMonth() + 1;
        const codigoCupon = Math.floor(Math.random() * 90000) + 10000;
        const codigo = 'SYSTEM_PC-' + codigoCupon + month;
        const { descuento, fechaExp } = req.body;
        const cupon = new Cupones_1.Cupon();
        cupon.codigo = codigo,
            cupon.descuento = descuento,
            cupon.fechaExp = new Date(fechaExp);
        newCupon = await cuponRepo.save(cupon);
        //all is ok
        res.json({ ok: true, message: 'Cupon Creado con exito', newCupon });
        console.log(newCupon);
    }
    catch (error) {
        console.log(error);
    }
};
CuponController.EstadoCupon = async (req, res) => {
    let cupon;
    const id = req.body;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = await cuponRepo.findOneOrFail(id);
        cupon.status = !cupon.status;
        await cuponRepo.save(cupon);
        res.json({ ok: true });
    }
    catch (error) {
        console.log(error);
    }
};
CuponController.MostrarCupones = async (req, res) => {
    let cupon;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = await cuponRepo.findAndCount();
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
};
//mostrar cupones Pajinados
CuponController.MostrarCuponesPaginados = async (req, res) => {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
        const [cupones, totalItems] = await cuponRepo.findAndCount({ take, skip: (pagina - 1) * take });
        if (cupones.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
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
};
//eliminar Cupon
CuponController.EliminarCupon = async (req, res) => {
    let cupon;
    const { id } = req.body;
    const cuponRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    try {
        cupon = await cuponRepo.findOneOrFail({ where: { id } });
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    //Try to delete Category
    try {
        await cuponRepo.remove(cupon);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ message: 'Cupon ha sido eliminado!', ok: true });
};
//enviar Cupon
CuponController.SendCupon = async (req, res) => {
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
                cuponExist = await cuponRepo.findOneOrFail({ where: { codigo: CODIGO_CUPON } });
                if (cuponExist.status == true) {
                    return res.status(400).json({ message: 'El cupón con el codigo: ' + CODIGO_CUPON + ' , ya ha sido utilizado!!!' });
                }
                else {
                    try {
                        cliente = await clienteRepo.findOne({ where: { email } });
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
                        await nodemailer_config_1.transporter.sendMail({
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
};
CuponController.MostrarCupon = async (req, res) => {
    const codeCoupon = req.query.code;
    const cpRepo = typeorm_1.getRepository(Cupones_1.Cupon);
    let cuponExist;
    try {
        cuponExist = await cpRepo.findOneOrFail({ where: { codigo: codeCoupon } });
        if (new Date(cuponExist.fechaExp).getTime() < Date.now()) {
            return res.send({ ok: false, message: 'Cupon expirado' });
        }
        if (cuponExist.status == true) {
            return res.send({ ok: false, message: 'Este cupon ya fue utilizado' });
        }
        else {
            return res.send({ ok: true });
        }
    }
    catch (error) {
        return res.send({ error, message: "Error en el servidor" });
    }
};
exports.default = CuponController;
//# sourceMappingURL=Cupon.js.map