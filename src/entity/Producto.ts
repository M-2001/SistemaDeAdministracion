import { Entity, PrimaryColumn, Unique, PrimaryGeneratedColumn, Column, OneToMany, JoinColumn, ManyToOne, OneToOne } from 'typeorm';
import { Proveedor } from './Proveedor';
import { Marca } from './Marca';
import { Categoria } from './Categoria';
import { type } from 'os';
import { Rating } from './Rating';
import { DetalleOrden } from './Detalles_Orden';
import { Order } from './Order';
import { Galeria } from './Galeria';

@Entity('producto')
@Unique(['codigo_Producto'])
export class Producto {
    
    @PrimaryGeneratedColumn()
    id : string;

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

    @Column({type: 'decimal', precision:19, scale: 2, default: 0.00})
    precioCompra: number;

    @Column({type: 'decimal', precision: 19 , scale: 2, default: 0.00})
    costo_standar : number;

    @Column({default: 0})
    catidad_por_unidad : number;

    @Column({default: 0})
    descuento : number;

    @Column({default:""})
    ActualizadoPor: string;

    @Column({default: ""})
    public_id : string

    @Column({default : 1})
    status : boolean;

    //relacion entre Producto y rating
    @OneToMany(() => Rating, (rating : Rating) => rating.producto)
    rating ?: Rating[];

    //relacion de producto con producto detalle
    @OneToMany(() => DetalleOrden, (detalleO : DetalleOrden) => detalleO.producto)
    detalleO ?: DetalleOrden[]

    @OneToMany(() => Galeria, (galeria : Galeria) => galeria.producto)
    galeria ?: Galeria[]
}