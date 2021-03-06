import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';

//import * as bcrypt from 'bcryptjs'
import { Producto } from './Producto';

@Entity("categoria")
@Unique(['categoria'])
export class Categoria {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    categoria: string;

    @Column({default : 1})
    status: boolean 

    @OneToMany(type => Producto, producto => producto.id)
    producto : Producto[]
}