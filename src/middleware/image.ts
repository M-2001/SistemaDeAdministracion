import * as path from 'path';
import * as multer from 'multer';

//middleware Image
const diskStorage = multer.diskStorage({
    destination: path.join('src/uploads/employees/'),
    filename: (req , file, cb)=>{
        cb(null, new Date().getMilliseconds() + '-' + file.originalname)
    }
});
const fileFilter = (req, file, cb)=>{
    //reject file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ){
        cb(null, true);
    }else{
        cb(null, false);
    }
};

const fileUpload = multer({
    storage: diskStorage,
    limits: {fileSize : 1024 * 1024 * 5},
    fileFilter: fileFilter
}).single('foto');

export default fileUpload;