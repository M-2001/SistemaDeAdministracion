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
exports.Producto = void 0;
const typeorm_1 = require("typeorm");
const Proveedor_1 = require("./Proveedor");
const Marca_1 = require("./Marca");
const Categoria_1 = require("./Categoria");
const Rating_1 = require("./Rating");
const Detalles_Orden_1 = require("./Detalles_Orden");
let Producto = class Producto {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", String)
], Producto.prototype, "id", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Producto.prototype, "codigo_Producto", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Producto.prototype, "nombreProducto", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Producto.prototype, "descripcion", void 0);
__decorate([
    typeorm_1.Column({ default: "producto.png" }),
    __metadata("design:type", String)
], Producto.prototype, "image", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Proveedor_1.Proveedor, (prov) => prov.producto),
    __metadata("design:type", Proveedor_1.Proveedor)
], Producto.prototype, "proveedor", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Marca_1.Marca, (marca) => marca.producto),
    __metadata("design:type", Marca_1.Marca)
], Producto.prototype, "marca", void 0);
__decorate([
    typeorm_1.ManyToOne(() => Categoria_1.Categoria, (categoria) => categoria.producto),
    __metadata("design:type", Categoria_1.Categoria)
], Producto.prototype, "categoria", void 0);
__decorate([
    typeorm_1.Column({ type: 'decimal', precision: 19, scale: 2 }),
    __metadata("design:type", Number)
], Producto.prototype, "costo_standar", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Producto.prototype, "catidad_por_unidad", void 0);
__decorate([
    typeorm_1.Column({ type: 'decimal', precision: 19, scale: 2 }),
    __metadata("design:type", Number)
], Producto.prototype, "descuento", void 0);
__decorate([
    typeorm_1.Column({ default: 1 }),
    __metadata("design:type", Boolean)
], Producto.prototype, "status", void 0);
__decorate([
    typeorm_1.OneToMany(() => Rating_1.Rating, (rating) => rating.producto),
    __metadata("design:type", Array)
], Producto.prototype, "rating", void 0);
__decorate([
    typeorm_1.OneToMany(() => Detalles_Orden_1.DetalleOrden, (detalleO) => detalleO.producto),
    __metadata("design:type", Array)
], Producto.prototype, "detalleO", void 0);
Producto = __decorate([
    typeorm_1.Entity('producto'),
    typeorm_1.Unique(['codigo_Producto'])
], Producto);
exports.Producto = Producto;
//# sourceMappingURL=Producto.js.map