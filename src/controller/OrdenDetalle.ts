import { getRepository } from 'typeorm';
import { Request, Response } from 'express';
import { DetalleOrden } from '../entity/Detalles_Orden';
import OrdenController from './Orden';
import Stripe from 'stripe';
const stripe = new Stripe(process.env.SECRETKEYSTRIPE, {apiVersion :'2020-08-27',})

const orden = OrdenController;

//const stripe = require('stripe')(process.env.SECRETKEYSTRIPE);

class OrdenDetalle {
    
    static AddOrdenDetalle = async (req: Request, res : Response)=>{
        const { clienteid } = res.locals.jwtPayload;
        try {
            const ordenDRepo = getRepository(DetalleOrden); 
            const ordenD = new DetalleOrden()
            ordenD.cantidad = clienteid

            console.log(clienteid);
            await ordenDRepo.save(ordenD);
        } catch (error) {
            res.status(400).json({message : 'Algo ha salio mal!'});
        }
        //all ok 
        res.json({message : 'Orden agregada!'});
    };

    //Intento Pago 

    // static IntentoPago = async(req : Request, res: Response)=>{
    //     const productos = req.body;
    //     const paymentIntent = await stripe.paymentIntents.create({
    //         amount : await  orden.getOrderAmaunt(productos),
    //         currency : 'usd',
    //     }).then(res => res).catch(err => err)
    //     res.send({client_Secret: paymentIntent.client_secret,});
    // }
}

export default OrdenDetalle;