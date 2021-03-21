import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, OneToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Cliente } from './Cliente';
import { DetalleOrden } from './Detalles_Orden';
import { Producto } from './Producto';


@Entity("orden")
export class Order {
    @PrimaryGeneratedColumn()
    id ?: number; 

    @ManyToOne(type => Cliente, cliente => cliente.order)
    cliente : Cliente[]

    @Column()
    @CreateDateColumn()
    fecha_Orden : Date;

    @Column({default : 1})
    status: boolean
    
    @OneToMany(type => DetalleOrden, detalle => detalle.orden)
    detalleOrden : DetalleOrden[];
}