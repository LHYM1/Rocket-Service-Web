// Las fotos subidas ANTES de migrar a Cloudinary quedaron guardadas con ruta relativa
// (ej. "/uploads/123.jpg"), servidas por el propio backend. Las subidas DESPUÉS de la
// migración ya vienen con la URL completa de Cloudinary (empieza con "http"). Esta
// función arma la URL correcta para cualquiera de los dos casos, sin romper las fotos
// viejas que ya existían antes del cambio.

export function urlFoto(url_imagen) {
    if (!url_imagen) return "";
    if (url_imagen.startsWith("http")) return url_imagen; // ya es una URL completa (Cloudinary)
    return `${url_imagen}`; // ruta vieja, local
}