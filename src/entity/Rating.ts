import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, UpdateDateColumn, CreateDateColumn} from "typeorm";
import { Producto } from './Producto';
import { Cliente } from './Cliente';
import ClienteController from '../controller/Cliente';

@Entity("rating")
export class Rating {

    @PrimaryGeneratedColumn()
    id ?: number;

    @ManyToOne(() => Producto, (producto : Producto) => producto.rating)
    producto ?: Producto;

    @ManyToOne(() => Cliente, (cliente : Cliente) => cliente.rating)
    cliente ?: Cliente;

    @Column()
    ratingNumber : number;

    @Column()
    titulo : string;

    @Column()
    comentario : string;

    @Column()
    @CreateDateColumn()
    createRating : Date;

    @Column()
    @UpdateDateColumn()
    modifiedRating : Date;

    @Column({default : true})
    status : boolean;

}
