
import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany} from "typeorm";

//import * as bcrypt from 'bcryptjs'
import { Producto } from './Producto';

@Entity("marca")
@Unique(["marca"])
export class Marca {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    marca: string;

    @Column({default : 1})
    status: boolean;

    @OneToMany(type => Producto, producto => producto.id)
    producto : Producto[]
}