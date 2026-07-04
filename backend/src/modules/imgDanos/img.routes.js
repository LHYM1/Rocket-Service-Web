import express from 'express';
const router = express.Router();
import imgDanosController from './imgDanos.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/multer.js';

// Admin ve todas
router.get('/listar', validarToken, verificarRol(['Administrador', 'Técnico']), imgDanosController.listarImgDanos);

// Órdenes del técnico en ESPERANDO REPUESTOS
router.get('/mis-ordenes', validarToken, verificarRol(['Técnico']), imgDanosController.listarOrdenesTecnico);

// Imágenes de una orden específica
router.get('/por-orden/:idOrden', validarToken, verificarRol(['Administrador', 'Técnico']), imgDanosController.listarPorOrden);

// Validar si orden tiene imágenes
router.get('/validar/:idOrden', validarToken, verificarRol(['Técnico']), imgDanosController.validarImagenes);

// Subir imagen (multer procesa el archivo)
router.post('/subir', validarToken, verificarRol(['Técnico']), upload.single('imagen'), imgDanosController.subirImagen);

// Eliminar
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador', 'Técnico']), imgDanosController.eliminarImagen);

export default router;