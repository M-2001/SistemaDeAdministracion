import { Entity, PrimaryGeneratedColumn, ManyToOne, Column, OneToMany } from 'typeorm';
import { Producto } from './Producto';

@Entity("galeria")
export class Galeria {
    @PrimaryGeneratedColumn()
    id : number; 

    @Column()
    imagen : string
        
    @ManyToOne(type => Producto, producto => producto.galeria)
    producto? : Producto;

    @Column({default: ""})
    public_id : string
    
    @Column({default: true})
    status: boolean

}

