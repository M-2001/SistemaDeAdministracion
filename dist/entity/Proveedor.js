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
const class_validator_1 = require("class-validator");
const typeorm_1 = require("typeorm");
//import * as bcrypt from 'bcryptjs'
const Producto_1 = require("./Producto");
let Proveedor = class Proveedor {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Proveedor.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Proveedor.prototype, "nombre_proveedor", void 0);
__decorate([
    class_validator_1.IsEmail(),
    typeorm_1.Column(),
    __metadata("design:type", String)
], Proveedor.prototype, "email", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Proveedor.prototype, "telefono", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Proveedor.prototype, "direccion", void 0);
__decorate([
    typeorm_1.Column({ default: 1 }),
    __metadata("design:type", Boolean)
], Proveedor.prototype, "status", void 0);
__decorate([
    typeorm_1.OneToMany(type => Producto_1.Producto, producto => producto.id),
    __metadata("design:type", Array)
], Proveedor.prototype, "producto", void 0);
Proveedor = __decorate([
    typeorm_1.Entity("proveedor"),
    typeorm_1.Unique(['nombre_proveedor'])
], Proveedor);
exports.Proveedor = Proveedor;
//# sourceMappingURL=Proveedor.js.map