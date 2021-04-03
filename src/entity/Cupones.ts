
import {Entity, PrimaryGeneratedColumn, Column, Unique, CreateDateColumn, } from "typeorm";


@Entity("cupon")
@Unique(["codigo"])
export class Cupon {

    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    codigo : string;

    @Column({type: 'decimal', precision: 19 , scale: 2})
    descuento : number;

    @Column()
    @CreateDateColumn()
    fechaExp : Date;

    @Column({default : 1})
    status: boolean;

}