import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany, ManyToOne, OneToOne, JoinColumn, CreateDateColumn } from 'typeorm';
import { Order } from './Order';
import { Producto } from './Producto';


@Entity("detalle_orden")
export class DetalleOrden {

    @PrimaryGeneratedColumn()
    id ?: number; 

    @ManyToOne(() => Order , (order : Order ) => order.detalleOrden)
    orden : Order;

    @ManyToOne(() => Producto, (producto: Producto)=> producto.detalleO)
    producto : Producto;

    @Column()
    cantidad : number;

    @Column({type: 'decimal', precision: 19 , scale: 2})
    totalUnidad : number;

    @Column({type: 'double', default: 0})
    descuento : number;

    @Column()
    @CreateDateColumn()
    fecha : Date;

    @Column({default : 1})
    status: boolean
}