import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, OneToOne, CreateDateColumn, JoinColumn } from 'typeorm';
import { Cliente } from './Cliente';
import { DetalleOrden } from './Detalles_Orden';
import { Producto } from './Producto';


@Entity("order")
export class Order {
    @PrimaryGeneratedColumn()
    id ?: number; 

    @ManyToOne(type => Cliente, cliente => cliente.order)
    cliente : Cliente[]

    @ManyToOne(() => Producto, (producto : Producto) => producto.orden)
    @JoinColumn()
    producto : Producto; 

    @Column()
    @CreateDateColumn()
    fecha_Orden : Date;



    @Column({default : 1})
    status: boolean
    
    // @OneToOne(type => DetalleOrden, detalle => detalle.orden)
    // detalle_orden : DetalleOrden[];
}