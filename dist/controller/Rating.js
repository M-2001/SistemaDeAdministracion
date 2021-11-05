"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
const typeorm_1 = require("typeorm");
const Rating_1 = require("../entity/Rating");
class RatingController {
}
_a = RatingController;
//Agregar rating a producto
RatingController.AgregarRating = async (req, res) => {
    const { clienteid } = res.locals.jwtPayload;
    const { productoId, ratingNumber, titulo, comentario } = req.body;
    const ratingRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
    const rating = new Rating_1.Rating();
    rating.ratingNumber = ratingNumber;
    rating.titulo = titulo;
    rating.comentario = comentario;
    rating.producto = productoId;
    rating.cliente = clienteid;
    //try so save rating
    try {
        await ratingRepo.save(rating);
        //all is ok
        res.json({ ok: true, message: "Rating agregado con exito" });
    }
    catch (error) {
        return res.status(400).json({ message: "Algo salio mal!" });
    }
};
//mostrar rating paginados
RatingController.MostrarRating = async (req, res) => {
    let pagina = req.query.pagina || 0;
    pagina = Number(pagina);
    let take = req.query.limit || 10;
    take = Number(take);
    try {
        const ratingRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
        const rating = await ratingRepo.query(` select r.id, r.ratingNumber, r.titulo, r.comentario, p.nombreProducto, c.apellido, c.nombre
            from rating r inner join producto p on r.productoId = p.id inner join cliente c on r.clienteId = c.id limit ${take} offset ${pagina} `);
        // producto.map(prod =>{
        //     delete prod.proveedor.email;
        //     delete prod.proveedor.telefono;
        //     delete prod.proveedor.direccion;
        //     delete prod.proveedor.status;
        //     delete prod.marca.status;
        //     delete prod.categoria.status;
        //     return producto
        // });
        if (rating.length > 0) {
            res.json({ ok: true, rating });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados",
            });
        }
    }
    catch (error) {
        return res.json({ ok: false, message: "Algo ha salido mal" });
    }
};
//Mostrar rating pajinado
RatingController.MostrarRatingPaginados = async (req, res) => {
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const ratingsRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
        const [ratings, totalItems] = await ratingsRepo
            .createQueryBuilder("rating")
            .innerJoin("rating.cliente", "cliente")
            .innerJoin("rating.producto", "producto")
            .addSelect(["cliente.nombre", "cliente.apellido"])
            .addSelect(["producto.nombreProducto"])
            .skip((pagina - 1) * take)
            .take(take)
            .getManyAndCount();
        if (ratings.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 == 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                ratings,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados!",
            });
        }
    }
    catch (error) {
        return res
            .status(400)
            .json({ ok: false, message: "Algo ha salido mal!" });
    }
};
//Mostrar rating por producto
RatingController.MostrarRatingPorProducto = async (req, res) => {
    const producto = req.query.id;
    let pagina = req.query.pagina || 1;
    pagina = Number(pagina);
    let take = req.query.limit || 5;
    take = Number(take);
    try {
        const ratingsRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
        const [ratings, totalItems] = await ratingsRepo
            .createQueryBuilder("rating")
            .innerJoin("rating.cliente", "cliente")
            .innerJoin("rating.producto", "producto")
            .addSelect([
            "cliente.nombre",
            "cliente.apellido",
            "cliente.imagen",
            "cliente.id",
        ])
            .addSelect(["producto.nombreProducto"])
            .skip((pagina - 1) * take)
            .take(take)
            .where({ producto })
            .getManyAndCount();
        if (ratings.length > 0) {
            let totalPages = totalItems / take;
            if (totalPages % 1 !== 0) {
                totalPages = Math.trunc(totalPages) + 1;
            }
            let nextPage = pagina >= totalPages ? pagina : pagina + 1;
            let prevPage = pagina <= 1 ? pagina : pagina - 1;
            res.json({
                ok: true,
                ratings,
                totalItems,
                totalPages,
                currentPage: pagina,
                nextPage,
                prevPage,
            });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron productos!",
            });
        }
    }
    catch (error) {
        return res.status(400).json({ message: "Algo ha salido mal!" });
    }
};
//Actualizar rating realizados por el usuario logado
RatingController.ActualizarRating = async (req, res) => {
    let rating;
    const { clienteid } = res.locals.jwtPayload;
    const { id } = req.params;
    const { ratingNumber, titulo, comentario } = req.body;
    const ratingRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
    try {
        rating = await ratingRepo
            .createQueryBuilder("rating")
            .leftJoin("rating.cliente", "rc")
            .addSelect(["rc.id", "rc.nombre", "rc.apellido"])
            .where({ id })
            .getOneOrFail();
        (rating.ratingNumber = ratingNumber),
            (rating.titulo = titulo),
            (rating.comentario = comentario);
        console.log(rating);
        if (rating.cliente.id === clienteid) {
            await ratingRepo.save(rating);
            res.json({ ok: true, message: "Rating actualizado" });
        }
        else {
            return res.json({
                ok: false,
                message: "No puedes modificar este rating",
            });
        }
    }
    catch (error) {
        return res
            .status(404)
            .json({
            ok: false,
            message: "No se han encontrado resultados con el id: " + id,
        });
    }
};
//eliminar ratin hechos por el usuario logado
RatingController.EliminarRating = async (req, res) => {
    let rating;
    const { clienteid } = res.locals.jwtPayload;
    const { id } = req.params;
    const ratingRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
    try {
        rating = await ratingRepo
            .createQueryBuilder("rating")
            .leftJoin("rating.cliente", "rc")
            .addSelect(["rc.id", "rc.nombre", "rc.apellido"])
            .where({ id })
            .getOneOrFail();
        console.log(rating);
        if (rating.cliente.id === clienteid) {
            await ratingRepo.delete(id);
            res.json({ ok: true, message: "Rating Eliminado!" });
        }
        else {
            return res.json({
                ok: false,
                message: "No puedes eliminar rating de otros usuarios",
            });
        }
    }
    catch (error) {
        return res
            .status(404)
            .json({
            ok: false,
            message: "No se han encontrado resultados con el id: " + id,
        });
    }
};
//mostrar rating id
RatingController.RatingPorId = async (req, res) => {
    let rating;
    const { id } = req.params;
    try {
        const ratingRepo = (0, typeorm_1.getRepository)(Rating_1.Rating);
        rating =
            await ratingRepo.query(` select r.id, r.ratingNumber, r.titulo, r.comentario, p.nombreProducto, c.apellido, c.nombre
            from rating r
            inner join producto p on r.productoId = p.id inner join cliente c on r.clienteId = c.id
            where r.id = '${id}'`);
        if (rating.length > 0) {
            res.json({ ok: true, rating });
        }
        else {
            res.json({
                ok: false,
                message: "No se encontraron resultados con el id: " + id,
            });
        }
    }
    catch (error) {
        return res
            .status(400)
            .json({ ok: false, message: "Algo ha salido mal" });
    }
};
exports.default = RatingController;
//# sourceMappingURL=Rating.js.map