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
exports.Categoria = void 0;
const typeorm_1 = require("typeorm");
//import * as bcrypt from 'bcryptjs'
const Producto_1 = require("./Producto");
let Categoria = class Categoria {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Categoria.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Categoria.prototype, "categoria", void 0);
__decorate([
    typeorm_1.Column({ default: 1 }),
    __metadata("design:type", Boolean)
], Categoria.prototype, "status", void 0);
__decorate([
    typeorm_1.OneToMany(type => Producto_1.Producto, producto => producto.id),
    __metadata("design:type", Array)
], Categoria.prototype, "producto", void 0);
Categoria = __decorate([
    typeorm_1.Entity("categoria"),
    typeorm_1.Unique(['categoria'])
], Categoria);
exports.Categoria = Categoria;
//# sourceMappingURL=Categoria.js.map