"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploads = void 0;
const multer = require("multer");
const dir = '../../src/uploads/productos/';
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        //const fileName = file.originalname.toLocaleLowerCase().split(' ').join('-');
        cb(null, file.filename + '-' + Date.now());
    }
});
exports.uploads = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype == "image/png" || file.mimetype == "image/jpg" || file.mimetype == "image/jpeg" || file.mimetype == "image/gif") {
            cb(null, true);
        }
        else {
            cb(null, false);
            return cb(new Error('Por favor seleccione formatos de imagen pemitidos'));
        }
    }
}).single('foto');
//# sourceMappingURL=multer.js.map