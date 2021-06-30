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
exports.Order = void 0;
const typeorm_1 = require("typeorm");
const Cliente_1 = require("./Cliente");
const Detalles_Orden_1 = require("./Detalles_Orden");
let Order = class Order {
};
__decorate([
    typeorm_1.PrimaryGeneratedColumn(),
    __metadata("design:type", Number)
], Order.prototype, "id", void 0);
__decorate([
    typeorm_1.ManyToOne(type => Cliente_1.Cliente, cliente => cliente.order),
    __metadata("design:type", Cliente_1.Cliente)
], Order.prototype, "cliente", void 0);
__decorate([
    typeorm_1.Column(),
    typeorm_1.CreateDateColumn(),
    __metadata("design:type", Date)
], Order.prototype, "fecha_Orden", void 0);
__decorate([
    typeorm_1.Column({ type: 'decimal', precision: 19, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Order.prototype, "PrecioTotal", void 0);
__decorate([
    typeorm_1.Column({ type: 'decimal', precision: 19, scale: 2, default: 0.00 }),
    __metadata("design:type", Number)
], Order.prototype, "TotalDesc", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", String)
], Order.prototype, "codigoOrden", void 0);
__decorate([
    typeorm_1.Column(),
    __metadata("design:type", Number)
], Order.prototype, "status", void 0);
__decorate([
    typeorm_1.OneToMany(type => Detalles_Orden_1.DetalleOrden, detalle => detalle.orden),
    __metadata("design:type", Array)
], Order.prototype, "detalleOrden", void 0);
Order = __decorate([
    typeorm_1.Entity("orden")
], Order);
exports.Order = Order;
//# sourceMappingURL=Order.js.map