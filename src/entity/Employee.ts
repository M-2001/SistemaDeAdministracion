import {Entity, PrimaryGeneratedColumn, Column, Unique} from "typeorm";

import * as bcrypt from 'bcryptjs'
import { IsEmail, IsNotEmpty, IsOptional} from "class-validator";

@Entity("empleado")
@Unique(['codeAccess'])
export class Employee {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    apellido: string;

    @Column()
    nombre: string;

    @Column()
    codeAccess : string;

    @Column({select : false})
    password : string;

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

    @Column({default: "", select : false})
    confirmacionCode: string

    @Column({default : "", select : false})
    @IsOptional()
    @IsNotEmpty()
    resetPassword : string;

    hashPassword():void{
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }
    checkPassword(password:string): boolean{
        return bcrypt.compareSync(password, this.password)
    }

}