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
exports.Galeria = void 0;
const typeorm_1 = require("typeorm");
const Producto_1 = require("./Producto");
let Galeria = class Galeria {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Galeria.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Galeria.prototype, "imagen", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Producto_1.Producto, producto => producto.galeria),
    __metadata("design:type", Producto_1.Producto)
], Galeria.prototype, "producto", void 0);
__decorate([
    typeorm_1.Column({ default: "" }),
    __metadata("design:type", String)
], Galeria.prototype, "public_id", void 0);
__decorate([
    typeorm_1.Column({ default: true }),
    __metadata("design:type", Boolean)
], Galeria.prototype, "status", void 0);
Galeria = __decorate([
    typeorm_1.Entity("galeria")
], Galeria);
exports.Galeria = Galeria;
//# sourceMappingURL=Galeria.js.map