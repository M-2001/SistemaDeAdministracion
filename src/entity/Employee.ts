import {Entity, PrimaryGeneratedColumn, Column, Unique} from "typeorm";

import * as bcrypt from 'bcryptjs'
import { IsEmail, IsNotEmpty, IsOptional } from "class-validator";

@Entity("empleado")
@Unique(['email'])
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    apellido: string;

    @Column()
    nombre: string;

    @IsEmail()
    @Column()
    email: string;

    @Column()
    password: string;

    @Column({default : ""})
    telefono: string;

    @Column({default : ""})
    direccion: string;

    @Column({default : "usuario.png"})
    imagen: string;

    @Column({default: ""})
    role: string;

    @Column({default : 0})
    estado: boolean;

    @Column()
    @IsOptional()
    @IsNotEmpty()
    resetPassword : string = 'token to reset password';

    hashPassword():void{
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }
    checkPassword(password:string): boolean{
        return bcrypt.compareSync(password, this.password)
    }

}