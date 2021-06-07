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
exports.EmpleadoController = void 0;
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
const Employee_1 = require("../entity/Employee");
const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");
class EmpleadoController {
}
exports.EmpleadoController = EmpleadoController;
//GetAll Employees
EmpleadoController.getEmpleados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const empleadoRepo = typeorm_1.getRepository(Employee_1.Employee);
    try {
        const empl = yield empleadoRepo.find();
        empl.map(empl => {
            delete empl.password;
            delete empl.hashPassword;
            return empl;
        });
        if (empl.length > 0) {
            res.send(empl);
        }
        else {
            res.status(404).json({ message: 'Not results!' });
        }
    }
    catch (e) {
        res.status(404).json({ message: 'Not results!' });
    }
});
//empleados Paginados
EmpleadoController.MostrarEmpleadosPaginados = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const empleadosRepo = typeorm_1.getRepository(Employee_1.Employee);
        const [empleados, totalItems] = yield empleadosRepo.createQueryBuilder('empleado')
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        empleados.map(emp => {
            delete emp.password;
            delete emp.confirmacionCode;
            delete emp.resetPassword;
            return empleados;
        });
        if (empleados.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({ ok: true, empleados, totalItems, totalPages, currentPage: pagina, nextPage, prevPage });
        }
        else {
            res.json({ message: 'No se encontraron resultados!' });
        }
    }
    catch (error) {
        res.json({ message: 'Algo ha salido mal!' });
    }
});
//getEmployeeByID
EmpleadoController.getEmpleadoByID = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const employeeRepo = typeorm_1.getRepository(Employee_1.Employee);
    try {
        const employee = yield employeeRepo.findOneOrFail({ select: [`id`, `apellido`, `nombre`, `codeAccess`, `telefono`, `direccion`, `imagen`, 'role', `estado`], where: { id } });
        const imgdir = path.resolve(__dirname, `../../src/uploads/employee/${employee.imagen}`);
        if (fs.existsSync(imgdir)) {
            res.sendFile(imgdir);
        }
        else {
            const notImage = path.resolve(__dirname, `../../src/server/assets/${employee.imagen}`);
            res.sendFile(notImage);
        }
    }
    catch (e) {
        res.status(404).json({ message: 'No hay registros con este id: ' + id });
    }
});
//create new employee de tipo Admin
EmpleadoController.AgregarEmpleadoA = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { apellido, nombre, code, password } = req.body;
    const token = jwt.sign({ codeAccess: req.body.code }, process.env.JWTSECRET, { expiresIn: '1h' });
    const empRepo = typeorm_1.getRepository(Employee_1.Employee);
    let employee;
    const message = 'Se ha registrado con exito!';
    let verifycationLink;
    let emailStatus = 'Ok';
    const codigo = 'SYSTEM-PC_ADMIN-' + code;
    //buscar e la base de datos si no existen regiatro con el mismo codigo
    const emailExist = yield empRepo.findOne({
        where: { codeAccess: codigo }
    });
    if (emailExist) {
        return res.status(400).json({ msj: 'Ya existe un regitro con el codigo: ' + codigo });
    }
    //el registro es creado si no existe
    employee = new Employee_1.Employee();
    employee.apellido = apellido;
    employee.nombre = nombre;
    employee.codeAccess = codigo;
    employee.password = password;
    employee.role = 'admin';
    employee.confirmacionCode = token;
    //validations
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(employee, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ message: 'Algo salio mal!' });
    }
    //verificar si el token existe
    try {
        verifycationLink = `http://localhost:9000/confirmRegister/${token}`;
    }
    catch (e) {
        console.log(e);
    }
    //TODO: HASH PASSWORD
    try {
        employee.hashPassword();
        yield empRepo.save(employee);
    }
    catch (e) {
        console.log(e);
    }
    //all ok
    res.json({ mjs: 'Registro creado con exito', verifycationLink });
});
//delete employee
EmpleadoController.EliminarEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const empRepo = typeorm_1.getRepository(Employee_1.Employee);
    try {
        const empl = yield empRepo.findOneOrFail(id);
        yield empRepo.delete(empl);
        const imgdir = path.resolve(__dirname, `../../src/uploads/employee/${empl.imagen}`);
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
//Editar Employee
EmpleadoController.EditarEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let employee;
    const { id } = req.params;
    const { apellido, nombre, telefono, direccion } = req.body;
    const emplRepo = typeorm_1.getRepository(Employee_1.Employee);
    try {
        employee = yield emplRepo.findOneOrFail(id);
        employee.apellido = apellido;
        employee.nombre = nombre;
        employee.telefono = telefono;
        employee.direccion = direccion;
    }
    catch (error) {
        return res.status(404).json({ message: 'No se han encontrado resultados ' });
    }
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(employee, ValidateOps);
    //try to save employee
    try {
        yield emplRepo.save(employee);
    }
    catch (error) {
        return res.status(409).json({ message: 'Algo ha salido mal!' });
    }
    res.json({ messge: 'El registro de ha actualizado' });
    console.log(id);
});
//subir imagen perfil
EmpleadoController.ImagenPerfilEmpleado = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = res.locals.jwtPayload;
    const employeeRepo = typeorm_1.getRepository(Employee_1.Employee);
    let employee;
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
            foto.mv(`src/uploads/employee/${nombreFoto}`, (err) => {
                if (err) {
                    return res.status(500).json({ ok: false, err });
                }
            });
            try {
                const employee = yield employeeRepo.findOneOrFail({ select: [`id`, `apellido`, `nombre`, `codeAccess`, `telefono`, `direccion`, `imagen`, 'role', `estado`],
                    where: { id } });
                const imgdir = path.resolve(__dirname, `../../src/uploads/employee/${employee.imagen}`);
                if (fs.existsSync(imgdir)) {
                    fs.unlinkSync(imgdir);
                }
                console.log(employee);
            }
            catch (e) {
                res.status(404).json({ message: 'No hay registros con este id: ' + id });
            }
            //try to save employee
            try {
                yield employeeRepo.createQueryBuilder().update(Employee_1.Employee).set({ imagen: nombreFoto }).where({ id }).execute();
            }
            catch (error) {
                res.status(409).json({ message: 'Algo ha salido mal!' });
            }
        }
        res.json({ message: 'La imagen se ha guardado.' });
    }
});
//create new employeeE 
EmpleadoController.AgregarEmpleadoE = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { apellido, nombre, code, password } = req.body;
    const codigo = 'SYSTEM-PC-' + code;
    const empRepo = typeorm_1.getRepository(Employee_1.Employee);
    const codeExist = yield empRepo.findOne({
        where: { codeAccess: codigo }
    });
    if (codeExist) {
        return res.status(400).json({ msj: 'Ya existe un empleado con el codigo : ' + codigo });
    }
    const employee = new Employee_1.Employee();
    employee.apellido = apellido;
    employee.nombre = nombre;
    employee.codeAccess = codigo;
    employee.password = password;
    employee.role = 'empleado';
    employee.estado = true;
    //validations
    const ValidateOps = { validationError: { target: false, value: false } };
    const errors = yield class_validator_1.validate(employee, ValidateOps);
    if (errors.length > 0) {
        return res.status(400).json({ errors });
    }
    //TODO: HASH PASSWORD
    try {
        employee.hashPassword();
        yield empRepo.save(employee);
    }
    catch (e) {
        res.status(409).json({ message: 'Algo salio mal Intenta nuevamente!' });
    }
    //all ok
    res.json({ mjs: 'Empleado se creo con exito' });
});
//# sourceMappingURL=Employee.js.map