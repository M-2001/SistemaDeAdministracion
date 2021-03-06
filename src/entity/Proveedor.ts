
import { IsEmail } from "class-validator";
import {Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany} from "typeorm";

//import * as bcrypt from 'bcryptjs'
import { Producto } from './Producto';

@Entity("proveedor")
@Unique(['nombre_proveedor'])
export class Proveedor {
    
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    nombre_proveedor: string;

    @IsEmail()
    @Column()
    email: string;

    @Column()
    telefono: string;

    @Column()
    direccion: string;

    @Column({default : 1})
    status: boolean;

    @OneToMany(type => Producto, producto => producto.id)
    producto : Producto[]
}