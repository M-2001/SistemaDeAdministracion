"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const bcrypt = require("bcryptjs");
const class_validator_1 = require("class-validator");
const Rating_1 = require("./Rating");
const Order_1 = require("./Order");
let Cliente = class Cliente {
    hashPassword() {
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }
    checkPassword(password) {
        return bcrypt.compareSync(password, this.password);
    }
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Cliente.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Cliente.prototype, "apellido", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Cliente.prototype, "nombre", void 0);
__decorate([
    class_validator_1.IsEmail(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Cliente.prototype, "email", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Cliente.prototype, "password", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Cliente.prototype, "telefono", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Cliente.prototype, "direccion", void 0);
__decorate([
    typeorm_1.Column({ default: "usuario.png" }),
    __metadata("design:type", String)
], Cliente.prototype, "imagen", void 0);
__decorate([
    typeorm_1.Column({ default: 'user' }),
    __metadata("design:type", String)
], Cliente.prototype, "role", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Cliente.prototype, "confirmacionCode", void 0);
__decorate([
    typeorm_1.Column({ default: 0 }),
    __metadata("design:type", Boolean)
], Cliente.prototype, "estado", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Cliente.prototype, "resetPassword", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Cliente.prototype, "refreshToken", void 0);
__decorate([
    typeorm_1.OneToMany(() => Rating_1.Rating, (rating) => rating.cliente),
    __metadata("design:type", Rating_1.Rating)
], Cliente.prototype, "rating", void 0);
__decorate([
    typeorm_1.OneToMany(() => Order_1.Order, (order) => order.cliente),
    __metadata("design:type", Array)
], Cliente.prototype, "order", void 0);
Cliente = __decorate([
    typeorm_1.Entity("cliente"),
    typeorm_1.Unique(['email'])
], Cliente);
exports.Cliente = Cliente;
//# sourceMappingURL=Cliente.js.map