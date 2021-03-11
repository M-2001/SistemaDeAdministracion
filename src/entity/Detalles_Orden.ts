import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, OneToOne, JoinColumn } from 'typeorm';
import { Cliente } from './Cliente';
import { Order } from './Order';
import { Producto } from './Producto';


@Entity("detalle_orden")
export class DetalleOrden {
    @PrimaryGeneratedColumn()
    id ?: number; 

    @OneToOne(() => Order)
    @JoinColumn()
    orden : Order;

    @OneToOne(() => Producto)
    @JoinColumn()
    producto : Producto;

    @Column()
    cantidad : number;

    @Column({type: 'decimal', precision: 19 , scale: 4})
    precio_unidad : number;

    @Column({type: 'double'})
    descuento : number;

    @Column()
    fecha : Date;

    @Column({default : 1})
    status: boolean
}