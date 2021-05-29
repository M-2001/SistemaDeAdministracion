"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jwt = require("jsonwebtoken");
exports.CheckJwt = (req, res, next) => {
    const token = req.headers.token;
    //check if parser is undefined
    if (typeof token !== 'undefined') {
        //split the space and get token from Array
        const bearer = token.split(':')[1];
        //set the token
        let jwtPayload;
        try {
            jwtPayload = jwt.verify(bearer, process.env.JWTSECRET);
            res.locals.jwtPayload = jwtPayload;
        }
        catch (e) {
            return res.status(401).json({ message: 'Lo sentimos, no estas authorizado para acceder!' });
        }
        const { id, email } = jwtPayload;
        const newToken = jwt.sign({ id, email }, process.env.JWTSECRET, {
            expiresIn: '24h'
        });
        res.setHeader('token', newToken);
        //Call NextFunction
        next();
    }
    else {
        //Forbidden
        res.status(403).json({ message: 'No Authorized!' });
    }
};
//# sourceMappingURL=jwt.js.map