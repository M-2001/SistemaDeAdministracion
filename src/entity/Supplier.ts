
import {Entity, PrimaryGeneratedColumn, Column} from "typeorm";

//import * as bcrypt from 'bcryptjs'

@Entity("supplier")
export class Supplier {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name_suplier: string;

    //@IsEmail()
    @Column()
    email_address: string;

    @Column()
    business_phone: string;

    @Column()
    address: string;

    @Column()
    web_page: string;

    @Column()
    status: boolean;

}