import cloudinary from './cloudinary.js';

/**
 * Sube un buffer de imagen (el que llega de multer en memoria) a Cloudinary,
 * y devuelve la URL segura resultante. Se usa desde cualquier controlador que
 * reciba una foto (imagenes_danos, pre_revision_fotos, etc.).
 */
export function subirACloudinary(buffer, carpeta = 'rocket-service') {
    return new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            { folder: carpeta },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );
        stream.end(buffer);
    });
}