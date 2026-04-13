import multer from 'multer';
import path from 'path';

// Configuración de almacenamiento temporal
const storage = multer.diskStorage({
    // Definimos dónde se guardará el archivo antes de subirlo a Cloudinary
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); 
    },
    filename: (req, file, cb) => {
        // Le damos un nombre único para evitar conflictos
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

// Filtro para aceptar solo imágenes
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten imágenes'), false);
    }
};

const upload = multer({ 
    storage: storage,
    fileFilter: fileFilter 
});

export default upload;