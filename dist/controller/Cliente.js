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
const Cliente_1 = require("../entity/Cliente");
const typeorm_1 = require("typeorm");
const class_validator_1 = require("class-validator");
const path = require("path");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const nodemailer_config_1 = require("../config/nodemailer.config");
class ClienteController {
}
//create new cliente
ClienteController.RegistroCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { apellido, nombre, email, password } = req.body;
    const token = jwt.sign({ email: req.body.email }, process.env.JWTSECRET, {
        expiresIn: '1h'
    });
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    const message = 'User was registered successfully! Please check your email';
    let verifycationLink;
    let emailStatus = 'Ok';
    //buscar en base de datos si no existen registros con el mismo email
    const emailExist = yield clienteRepo.findOne({
        where: { email: email }
    });
    if (emailExist) {
        return res.status(400).json({ msj: 'Ya existe un usuario con el email' + email });
    }
    //Si no existe un resultado devuelto procede a crearlo
    cliente = new Cliente_1.Cliente();
    cliente.apellido = apellido;
    cliente.nombre = nombre;
    cliente.email = email;
    cliente.password = password;
    cliente.confirmacionCode = token;
    //validations
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(cliente, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    try {
        verifycationLink = `http://localhost:9000/confirmUser/${token}`;
    }
    catch (e) {
        return res.json({ error: 'something goes wrong!' });
    }
    //TODO: sendEmail
    try {
        yield nodemailer_config_1.transporter.sendMail({
            from: '"Confirmacion de Cuenta " <castlem791@gmail.com>',
            to: cliente.email,
            subject: "Confirmacion de cuenta",
            html: `<b>Please check on the following link , or paste this into your browser to complete the process:</b> 
        <a href="${verifycationLink}">${verifycationLink}</a>`,
        });
    }
    catch (error) {
        emailStatus = error;
        return res.status(401).json({ message: 'Something goes wrong!' });
    }
    //all ok
    //TODO: HASH PASSWORD
    try {
        cliente.hashPassword();
        clienteRepo.save(cliente);
    }
    catch (e) {
        res.status(409).json({ message: 'something goes wrong' });
    }
    //res.json({mjs: 'Registro creado con exito!'})
    res.send({ message });
});
//Obtener todos los empleados
ClienteController.getClientes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    try {
        const cliente = yield clienteRepo.find();
        cliente.map(cliente => {
            delete cliente.password;
            delete cliente.resetPassword;
            delete cliente.confirmacionCode;
            delete cliente.role;
            delete cliente.estado;
            return cliente;
        });
        if (cliente.length > 0) {
            res.json({ cliente });
        }
        else {
            res.status(404).json({ message: 'Not results!' });
        }
    }
    catch (e) {
        res.status(404).json({ message: 'Not results!' });
    }
});
//subir imagen perfil
ClienteController.ImagenPerfilCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = res.locals.jwtPayload;
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    let cliente;
    if (req.files === undefined || req.files.foto === undefined) {
        res.status(400).json({ ok: false, message: 'Ningun archivo selecionando' });
    }
    else {
        let foto = req.files.foto;
        let fotoName = foto.name.split('.');
        console.log(fotoName);
        let ext = fotoName[fotoName.length - 1];
        //extensiones permitidas 
        const extFile = ['png', 'jpeg', 'jpg', 'git'];
        if (extFile.indexOf(ext) < 0) {
            return res.status(400)
                .json({ message: 'Las estensiones permitidas son ' + extFile.join(', ') });
        }
        else {
            //cambiar nombre del archivo
            var nombreFoto = `${id}-${new Date().getMilliseconds()}.${ext}`;
            foto.mv(`src/uploads/usuarios/${nombreFoto}`, (err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err });
                }
            });
            try {
                const cliente = yield clienteRepo.findOneOrFail({ select: [`id`, `apellido`, `nombre`, `email`, `telefono`, `direccion`, `imagen`, 'role', `estado`],
                    where: { id } });
                const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios/${cliente.imagen}`);
                if (fs.existsSync(imgdir)) {
                    fs.unlinkSync(imgdir);
                }
                console.log(cliente);
            }
            catch (e) {
                res.status(404).json({ message: 'No hay registros con este id: ' + id });
            }
            //try to save employee
            try {
                yield clienteRepo.createQueryBuilder().update(Cliente_1.Cliente).set({ imagen: nombreFoto }).where({ id }).execute();
            }
            catch (error) {
                res.status(409).json({ message: 'Algo ha salido mal!' });
            }
        }
        res.json({ message: 'La imagen se ha guardado.' });
    }
});
//getClienteByID
ClienteController.getClienteByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    try {
        const cliente = yield clienteRepo.findOneOrFail({ select: [`id`, `apellido`, `nombre`, `email`, `telefono`, `direccion`, `imagen`,],
            where: { id } });
        const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios/${cliente.imagen}`);
        if (fs.existsSync(imgdir)) {
            res.sendFile(imgdir);
        }
        else {
            const notImage = path.resolve(__dirname, `../../src/server/assets/${cliente.imagen}`);
            res.sendFile(notImage);
        }
    }
    catch (e) {
        res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
//Editar cliente
ClienteController.EditarCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let cliente;
    const { id } = res.locals.jwtPayload;
    const { apellido, nombre, telefono, direccion } = req.body;
    const emplRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    try {
        cliente = yield emplRepo.findOneOrFail(id);
        cliente.apellido = apellido;
        cliente.nombre = nombre;
        cliente.telefono = telefono;
        cliente.direccion = direccion;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(cliente, ValidateOps);
    //try to save cliente
    try {
        yield emplRepo.save(cliente);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'Datos actulizados!' });
    console.log(id);
});
//delete cliente
ClienteController.EliminarCliente = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const clienteRepo = typeorm_1.getRepository(Cliente_1.Cliente);
    try {
        const cliente = yield clienteRepo.findOneOrFail(id);
        yield clienteRepo.delete(cliente);
        const imgdir = path.resolve(__dirname, `../../src/uploads/usuarios${cliente.imagen}`);
        if (fs.existsSync(imgdir)) {
            fs.unlinkSync(imgdir);
        }
        //delete 
        res.status(201).json({ message: 'Empleado eliminado' });
    }
    catch (e) {
        res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
exports.default = ClienteController;
//# sourceMappingURL=Cliente.js.map