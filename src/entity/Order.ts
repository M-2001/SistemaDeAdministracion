import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, CreateDateColumn } from 'typeorm';
import { Cliente } from './Cliente';
import { DetalleOrden } from './Detalles_Orden';


@Entity("orden")
export class Order {
    @PrimaryGeneratedColumn()
    id ?: number; 

    @ManyToOne(type => Cliente, cliente => cliente.order)
    cliente : Cliente

    @Column()
    @CreateDateColumn()
    fecha_Orden : Date;

    @Column({type: 'decimal', precision: 19 , scale: 2, default : 0.00})
    PrecioTotal: number;

    @Column({type: 'decimal', precision: 19 , scale: 2, default : 0.00})
    TotalDesc: number;

    @Column()
    codigoOrden : string

    @Column()
    status: number
    
    @OneToMany(type => DetalleOrden, detalle => detalle.orden)
    detalleOrden ?: DetalleOrden[];
}