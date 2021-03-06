import { Entity, PrimaryColumn, Unique, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne } from 'typeorm';
import { Proveedor } from './Proveedor';
import { Marca } from './Marca';
import { Categoria } from './Categoria';
import { type } from 'os';
import { Rating } from './Rating';

@Entity('producto')
@Unique(['codigo_Producto'])
export class Producto {
    @PrimaryGeneratedColumn()
    id : number;

    @Column()
    codigo_Producto: string

    @Column()
    nombreProducto: string;

    @Column()
    descripcion : string;

    @Column({ default: "producto.png" })
    image : string;

    @ManyToOne(() => Proveedor, (prov : Proveedor ) => prov.producto)
    proveedor?: Proveedor;

    @ManyToOne(() => Marca, (marca : Marca) => marca.producto)
    marca?: Marca;
    
    @ManyToOne(() => Categoria, (categoria : Categoria) => categoria.producto)
    categoria?: Categoria;

    @Column()
    costo_standar : number;

    @Column()
    list_price : number;

    @Column()
    catidad_por_unidad : string;

    @Column()
    descuento : number;

    @Column({default : 1})
    status : boolean;

    //relacion entre Producto y rating
    @OneToMany(() => Rating, (rating : Rating) => rating.producto)
    rating ?: Rating[];
}