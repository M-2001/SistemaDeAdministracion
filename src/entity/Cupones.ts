
import {Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, } from "typeorm";


@Entity("cupon")
@Unique(["codigo"])
export class Cupon {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigo : string;

    @Column()
    descuento : number;

    @Column()
    @CreateDateColumn()
    fechaExp : Date;

    @Column({default : 0})
    status: boolean;

}