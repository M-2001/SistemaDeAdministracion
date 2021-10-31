require("dotenv").config();
import { Request, Response } from "express";
import CarritoController from "./Carrito";
import { Producto } from "../entity/Producto";
import { getRepository } from "typeorm";
import { Order } from "../entity/Order";
import { DetalleOrden } from "../entity/Detalles_Orden";
import { transporter } from "../middleware/mailer";
import PaypalSdk = require("paypal-rest-sdk");
import { Cliente } from "../entity/Cliente";
import { Cupon } from "../entity/Cupones";
import ItemProducto from "../entity/ItemEmail";

PaypalSdk.configure({
	mode: "sandbox", //sandbox or live
	client_id: process.env.CLIENT_ID,
	client_secret: process.env.CLIENT_SECRET,
});

//interfaz para recibir parametro del body
interface Product {
	id?: string;
	qt: number;
}

let Items: any;

class PayController {
	//metodo de pago paypal
	static Pay = async (req: Request, res: Response) => {
		let items: Product[] = req.body;
		let CODIGO_CUPON = req.query.CODIGO_CUPON;
		Items = items;
		//let CODE_CUPON = CODIGO_CUPON;
		const proRepo = getRepository(Producto);
		const cuponRepo = getRepository(Cupon);
		let totalPrice: number = 0;
		let cuponExist: Cupon;

		try {
			//verificar CODE_CUPON
			if (CODIGO_CUPON) {
				try {
					cuponExist = await cuponRepo.findOneOrFail({
						where: { codigo: CODIGO_CUPON },
					});
					if (cuponExist.status == true) {
						return res
							.status(400)
							.json({
								ok: false,
								message:
									"El cupón con el codigo: " +
									CODIGO_CUPON +
									" , ya ha sido utilizado!!!",
							});
					} else {
						try {
							for (let index = 0; index < items.length; index++) {
								let amount: number = 0;
								const item = items[index];
								const productoItem =
									await proRepo.findOneOrFail(item.id);

								//dividir el descuento del cupon entre los items que vienen del request
								let descuentoProducto =
									cuponExist.descuento / items.length;
								let descProducto = parseFloat(
									descuentoProducto.toFixed(2)
								);

								let operacion =
									productoItem.costo_standar * item.qt;
								let totaldesc =
									(operacion * descProducto) / 100;
								let Totaldesc = parseFloat(
									totaldesc.toFixed(2)
								);

								let totalPay = operacion - Totaldesc;

								amount += totalPay;
								totalPrice += totalPay;

								const OnlyTwoDecimals = amount.toFixed(2);
							}
						} catch (error) {
							return res
								.status(400)
								.json({
									ok: false,
									message: "Algo salio mal!",
								});
						}
					}
				} catch (error) {
					return res
						.status(400)
						.json({
							ok: false,
							message:
								"El cupón con el codigo: " +
								CODIGO_CUPON +
								" no es valido!!!",
						});
				}
			} else {
				try {
					for (let index = 0; index < items.length; index++) {
						let amount: number = 0;
						const item = items[index];
						const productoItem = await proRepo.findOneOrFail(
							item.id
						);

						let operacion = productoItem.costo_standar * item.qt;
						let Totaldesc =
							(operacion * productoItem.descuento) / 100;
						let totalPay = operacion - Totaldesc;
						amount += totalPay;
						totalPrice += totalPay;
						const OnlyTwoDecimals = amount.toFixed(2);
					}
				} catch (error) {
					return res
						.status(400)
						.json({ ok: false, message: "Algo salio mal!" });
				}
			}
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
		let urlSuccess: any;
		let total: string;
		if (cuponExist) {
			urlSuccess =
				"https://client-mye-soporte.vercel.app/pay?CODIGO_CUPON=" +
				CODIGO_CUPON;
			total = totalPrice.toFixed(2);
		} else {
			urlSuccess = "https://client-mye-soporte.vercel.app/pay";
			total = totalPrice.toFixed(2);
		}

		//try to pay
		try {
			const create_payment = {
				intent: "sale",
				payer: {
					payment_method: "paypal",
				},
				redirect_urls: {
					return_url: urlSuccess,
					cancel_url:
						"https://mye-soporte-server.herokuapp.com/api/pay-checkout/cancel",
				},
				transactions: [
					{
						amount: {
							currency: "USD",
							total: total,
						},
						description: " This is the payment description ",
					},
				],
			};
			PaypalSdk.payment.create(
				create_payment,
				function (error: any, payment: any) {
					if (error) {
						throw error;
					} else {
						if (create_payment.payer.payment_method === "paypal") {
							var redirectUrl;
							for (
								let index = 0;
								index < payment.links.length;
								index++
							) {
								var link = payment.links[index];
								if (link.method === "REDIRECT") {
									redirectUrl = link.href;
									//res.redirect(payment.links[index].href)
								}
							}
							res.send({ redirectUrl });
						}
					}
				}
			);
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}
	};

	//metodo que da continuidad al metodo de pago paypal se encarga de guardar ordenes y detalles de ordenes en base de datos
	static PaySuccess = async (req: Request, res: Response) => {
		const { clienteid } = res.locals.jwtPayload;
		const ordenRepo = getRepository(Order);
		const ordeDRepo = getRepository(DetalleOrden);
		const proRepo = getRepository(Producto);
		const cuponRepo = getRepository(Cupon);
		const clienteRepo = getRepository(Cliente);

		let items = Items;
		let ordenC: Order;
		let cuponExist: Cupon;
		let SaveDtO: DetalleOrden;

		const payerId: any = req.query.PayerID;
		const paymentId: any = req.query.paymentId;
		const CODIGO_CUPON: any = req.query.CODIGO_CUPON;
		let totalPrice: number = 0;
		let totalDesc: number = 0;
		let total: any;
		let BeneficioTotal: number = 0;
		let descuentoCupon: number = 0.0;
		let ParseTotal: number;

		////declaraciones de IVA
		let PorcentajeTotal: number = 1.0;
		let PorcentajeIVA: number = 0.13;
		let TotalIva = PorcentajeTotal + PorcentajeIVA;

		const itemEmail: ItemProducto[] = [];

		try {
			//verificar CODE_CUPON
			if (CODIGO_CUPON) {
				try {
					cuponExist = await cuponRepo.findOneOrFail({
						where: { codigo: CODIGO_CUPON },
					});
					if (cuponExist.status == true) {
						return res
							.status(400)
							.json({
								ok: false,
								message:
									"El cupón con el codigo: " +
									CODIGO_CUPON +
									" , ya ha sido utilizado!!!",
							});
					} else {
						let date = new Date();
						let month = date.getMonth() + 1;
						const codigoOrden =
							Math.floor(Math.random() * 90000) + 10000;
						const codigoO = "M&E-" + codigoOrden + month;

						const or = new Order();
						or.cliente = clienteid;
						or.codigoOrden = codigoO;
						or.status = 2;
						ordenC = await ordenRepo.save(or);

						for (let index = 0; index < items.length; index++) {
							let amount: number = 0;
							let totalIVA: number = 0.0;
							const item = items[index];
							const productoItem = await proRepo.findOneOrFail(
								item.id
							);

							//dividir el descuento del cupon entre los items que vienen del request
							let descuentoProducto =
								cuponExist.descuento / items.length;
							let descProducto = parseFloat(
								descuentoProducto.toFixed(2)
							);

							try {
								let operacion =
									productoItem.costo_standar * item.qt;

								//CalculoNeto
								let neto = operacion / TotalIva;
								let Neto = neto.toFixed(2);

								let totaldesc =
									(operacion * descProducto) / 100;
								let Totaldesc = parseFloat(
									totaldesc.toFixed(2)
								);

								let totalPay = operacion - Totaldesc;
								let qtyExist =
									productoItem.catidad_por_unidad - item.qt;

								amount += totalPay;
								totalPrice += totalPay;
								totalDesc += Totaldesc;
								const OnlyTwoDecimals = amount.toFixed(2);

								let itemString: string = item.qt.toString();

								//declaraciones de IVA
								let precioSinIVA = amount / TotalIva;
								let newPreciosSinIVA = parseFloat(
									precioSinIVA.toFixed(2)
								);

								totalIVA += newPreciosSinIVA;

								let totIVA = amount - newPreciosSinIVA;
								let TotIVA = parseFloat(totIVA.toFixed(2));

								let beneficioLocal =
									totalPay -
									productoItem.precioCompra * item.qt;

								let beneficioSinIVA = beneficioLocal / TotalIva;
								let BeneficioLocal = parseFloat(
									beneficioSinIVA.toFixed(2)
								);

								BeneficioTotal += BeneficioLocal;

								try {
									//save Orden Detalle
									let totalDesto = parseFloat(
										Totaldesc.toFixed(2)
									);
									const saveOD = new DetalleOrden();
									(saveOD.orden = ordenC),
										(saveOD.producto = productoItem),
										(saveOD.cantidad = item.qt),
										(saveOD.totalUnidad = newPreciosSinIVA),
										(saveOD.impuesto = TotIVA),
										(saveOD.descuento = totalDesto),
										(saveOD.beneficioLocal =
											BeneficioLocal);

									SaveDtO = await ordeDRepo.save(saveOD);
								} catch (error) {
									return res
										.status(400)
										.json({
											ok: false,
											message:
												"Algo salio mal al intentar guardar detalles de Orden!",
										});
								}
								let totalProducto =
									SaveDtO.totalUnidad + SaveDtO.impuesto;
								ParseTotal = parseFloat(
									totalProducto.toFixed(2)
								);

								let itm = {
									codigoOrden: ordenC.codigoOrden,
									cantidad: itemString,
									producto: productoItem.nombreProducto,
									precioOriginal: productoItem.costo_standar,
									descuento: descProducto,
									totalNto: Neto,
									IVA: TotIVA,
									totalProducto: ParseTotal,
								};

								itemEmail.push(itm);

								//actualizar producto
								try {
									productoItem.catidad_por_unidad = qtyExist;
									const saveProduct = await proRepo.save(
										productoItem
									);
								} catch (error) {
									return res
										.status(400)
										.json({
											ok: false,
											message: "Algo salio mal!",
										});
								}
							} catch (error) {
								return res
									.status(400)
									.json({
										ok: false,
										message: "Algo salio mal!",
									});
							}
						}
					}
				} catch (error) {
					return res
						.status(400)
						.json({
							ok: false,
							message:
								"El cupón con el codigo: " +
								CODIGO_CUPON +
								" no es valido!!!",
						});
				}
			} else {
				//guardar Orden sin cupon
				let date = new Date();
				let month = date.getMonth() + 1;
				const codigoOrden = Math.floor(Math.random() * 90000) + 10000;
				const codigoO = "M&E-" + codigoOrden + month;

				const or = new Order();
				or.cliente = clienteid;
				or.codigoOrden = codigoO;
				or.status = 2;
				ordenC = await ordenRepo.save(or);

				for (let index = 0; index < items.length; index++) {
					let amount: number = 0;
					let totalIVA: number = 0.0;
					const item = items[index];
					const productoItem = await proRepo.findOneOrFail(item.id);

					//calcular operacion de precio por la cantidad de producto
					let operacion = productoItem.costo_standar * item.qt;

					//Calcular precio Nto
					let neto = operacion / TotalIva;
					let Neto = neto.toFixed(2);

					let totaldesc = (operacion * productoItem.descuento) / 100;
					let Totaldesc = parseFloat(totaldesc.toFixed(2));
					let totalPay = operacion - Totaldesc;
					let qtyExist = productoItem.catidad_por_unidad - item.qt;

					amount += totalPay;

					totalPrice += totalPay;

					totalDesc += Totaldesc;

					const OnlyTwoDecimals = amount.toFixed(2);
					const parseAmount = parseInt(
						OnlyTwoDecimals.replace(".", "."),
						10
					);

					let itemString: string = item.qt.toString();

					let precioSinIVA = amount / TotalIva;
					let newPreciosSinIVA = parseFloat(precioSinIVA.toFixed(2));

					totalIVA += newPreciosSinIVA;

					let totIVA = amount - newPreciosSinIVA;
					let TotIVA = parseFloat(totIVA.toFixed(2));

					//calculo beneficio local
					let beneficioLocal =
						totalPay - productoItem.precioCompra * item.qt;

					let beneficioSinIVA = beneficioLocal / TotalIva;
					let BeneficioLocal = parseFloat(beneficioSinIVA.toFixed(2));

					BeneficioTotal += BeneficioLocal;

					try {
						//save Orden Detalle
						let totalDesto = parseFloat(Totaldesc.toFixed(2));
						const saveOD = new DetalleOrden();
						(saveOD.orden = ordenC),
							(saveOD.producto = productoItem),
							(saveOD.cantidad = item.qt),
							(saveOD.totalUnidad = newPreciosSinIVA),
							(saveOD.impuesto = TotIVA),
							(saveOD.descuento = totalDesto),
							(saveOD.beneficioLocal = BeneficioLocal);

						SaveDtO = await ordeDRepo.save(saveOD);
					} catch (error) {
						return res
							.status(400)
							.json({ ok: false, message: "Algo salio mal!" });
					}
					let totalProducto = SaveDtO.totalUnidad + SaveDtO.impuesto;
					ParseTotal = parseFloat(totalProducto.toFixed(2));
					let itm = {
						codigoOrden: ordenC.codigoOrden,
						cantidad: itemString,
						producto: productoItem.nombreProducto,
						precioOriginal: productoItem.costo_standar,
						descuento: productoItem.descuento,
						totalNto: Neto,
						IVA: TotIVA,
						totalProducto: ParseTotal,
					};

					itemEmail.push(itm);
					//actualizar producto
					try {
						productoItem.catidad_por_unidad = qtyExist;
						const saveProduct = await proRepo.save(productoItem);
					} catch (error) {
						return res
							.status(400)
							.json({ ok: false, message: "Algo salio mal!" });
					}
				}
			}
		} catch (error) {
			return res
				.status(400)
				.json({ ok: false, message: "Algo salio mal!" });
		}

		if (cuponExist) {
			ordenC.PrecioTotal = totalPrice;
			ordenC.TotalDesc = totalDesc;
			ordenC.BeneficioVenta = BeneficioTotal;

			const actualizarOrden = await ordenRepo.save(ordenC);
			total = totalPrice.toFixed(2);

			cuponExist.status = true;
			const statusCupon = await cuponRepo.save(cuponExist);
		} else {
			(ordenC.PrecioTotal = totalPrice),
				(ordenC.TotalDesc = totalDesc),
				(ordenC.BeneficioVenta = BeneficioTotal);
			const actualizarOrden = await ordenRepo.save(ordenC);
			total = totalPrice.toFixed(2);
		}

		//try to send email buy

		try {
			let direccionLocal: string =
				"6 Avenida Norte 3-11, Sonsonate, Sonsonate";
			let date = new Date();
			const infoCliente = await clienteRepo.findOneOrFail(clienteid);
			let subject: string = ` ${
				infoCliente.nombre +
				" " +
				infoCliente.apellido +
				" Gracias por su Compra!!!"
			} `;

			let content = itemEmail.reduce((a, b) => {
				return (
					a +
					"<tr><td>" +
					b.producto +
					"</td><td>" +
					b.cantidad +
					"</td><td>" +
					"$" +
					b.precioOriginal +
					"</td><td>" +
					b.descuento +
					"%" +
					"</td><td>" +
					"$" +
					b.IVA +
					"</td><td>" +
					"$" +
					b.totalNto +
					"</td><td>" +
					"$" +
					b.totalProducto +
					"</td></tr>"
				);
			}, "");

			let descTotal = itemEmail
				.map((a) => a.descuento)
				.reduce((a, b) => a + b);

			let TotalIVA = itemEmail
				.map((a) => a.IVA)
				.reduce((a, b) => a + b, 0);

			let email = process.env.CORREO;
			await transporter.sendMail({
				from: `"M&E Soporte Tecnico, Sonsonate" <${email}>`, //sender address
				to: infoCliente.email,
				subject: subject,
				html: ` <!DOCTYPE html>
                        <html lang="en">
                        <head> </head>
                        <body><div>
                        <h3>Gracias por su Compra!!!</h3>
                        <h4>Comprador:</h4>
                <p>Nombre: ${
					infoCliente.nombre + " " + infoCliente.apellido
				}</p>
                <p>Email : ${infoCliente.email}</p>
                <p>Dia Compra : ${date}</p>
                <p>Codigo Orden: ${ordenC.codigoOrden}</p>

                <h4>Vendido Por: </h4>
                <p>Dirección Compra : </p>
                <p>M&E Soporte Tecnico Sonsonate, ${direccionLocal}</p>
                <p>Productos incluidos en compra: </p>

                <table style = "border: hidden" >
                    <thead class="tablahead" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;">
                    <tr>
                    <th id="Descripcion">Descripcion</th>
                    <th id="UDS">Uds</th>
                    <th id="Precio">Precio</th>
                    <th id="desc">DescProducto</th>
                    <th id="Iva">IVA 13%</th>
                    <th id="TotalNto">TotalNto</th>
                    <th id="Total">Total</th>
                    </tr>
                </thead>
                <tbody id="bodytabla">

                ${content}

                </tbody>
                </table>
                <p>Descuento Total : $${totalDesc}</p>

                <p>IVA: $${parseFloat(TotalIVA.toFixed(2))}</p>

                <p>Total compra: $${total}</p>
                <a href="https://client-mye-soporte.vercel.app">Visitanos pronto !</a>
                </div>
                </body>
                </html>`,
			});
		} catch (error) {
			return console.log("Algo salio mal al intentar enviar email!!!");
		}

		//Proceso Paypal
		try {
			const execute_payment = {
				payer_id: payerId,
				transactions: [
					{
						amount: {
							currency: "USD",
							total: total,
						},
					},
				],
			};
			PaypalSdk.payment.execute(
				paymentId,
				execute_payment,
				function (error: any, payment: any) {
					if (error) {
						throw error;
					} else {
						res.json({
							ok: true,
							message: "Gracias por su compra",
						});
					}
				}
			);
		} catch (error) {
			return res
				.status(400)
				.json({
					ok: false,
					message: "Algo ha fallado a hacer la compra",
				});
		}
	};
}
export default PayController;
