
import { Entity, PrimaryGeneratedColumn, Column, Unique, OneToMany } from 'typeorm';

import * as bcrypt from 'bcryptjs'
import { IsEmail, IsNotEmpty, IsOptional } from 'class-validator';
import { Rating } from './Rating';

@Entity("cliente")
@Unique(['email'])
export class Cliente {
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

    @Column()
    role: string;

    @Column()
    estado: boolean;

    @Column({select : false})
    @IsOptional()
    @IsNotEmpty()
    resetPassword : string = 'token to reset password';

    //relacion entre Producto y rating
    @OneToMany(() => Rating, (rating : Rating) => rating.cliente)
    rating ?: Rating;

    hashPassword():void{
        const salt = bcrypt.genSaltSync(10);
        this.password = bcrypt.hashSync(this.password, salt);
    }
    checkPassword(password:string): boolean{
        return bcrypt.compareSync(password, this.password)
    }
}