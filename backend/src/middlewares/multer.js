import multer from 'multer';

// Guarda el archivo en MEMORIA (no en disco), como un buffer temporal en RAM.
// Desde ahí, cada controlador lo sube a Cloudinary manualmente (ver subirACloudinary.js).
// Se evita el paquete "multer-storage-cloudinary" porque no es compatible con
// la versión 2 de Cloudinary que usa este proyecto (conflicto de dependencias).
const storage = multer.memoryStorage();

// Filtro para aceptar solo imágenes (igual que antes)
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