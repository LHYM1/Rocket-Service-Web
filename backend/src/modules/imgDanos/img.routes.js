import express from 'express';
const router = express.Router();
import controllerImgDan from './imgDanos.controller.js';
import upload from '../../middlewares/multer.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

// Listado completo -- Admin y Técnico
router.get('/listar', validarToken(["Administrador", "Técnico"]), controllerImgDan.listarImgDanos);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico"]), controllerImgDan.ObtenerImgDanos);

// Fotos de UNA orden -- Admin, Técnico y Cliente
router.get('/por-orden/:id_orden', validarToken(["Administrador", "Técnico", "Cliente"]), controllerImgDan.obtenerPorOrden);

// Subir foto -- Admin y Técnico
router.post('/crear', validarToken(["Administrador", "Técnico"]), upload.single('url_imagen'), controllerImgDan.crearImagenDanos);
router.put('/modificar/:id', validarToken(["Administrador", "Técnico"]), upload.single('url_imagen'), controllerImgDan.actImgDanos);
router.delete('/eliminar/:id', validarToken(["Administrador", "Técnico"]), controllerImgDan.eliminarImgDano);

export default router;