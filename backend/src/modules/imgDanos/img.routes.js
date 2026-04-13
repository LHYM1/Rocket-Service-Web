import express from 'express';
const router = express.Router();
import controllerImgDan from './imgDanos.controller.js';
// configuración de multer
import upload from '../../middlewares/multer.js'; 

// Rutas para imagenes danos 
router.get('/listar', controllerImgDan.listarImgDanos);
router.get('/consultar/:id', controllerImgDan.ObtenerImgDanos);

// Añadimos upload.single('url_imagen')
// 'url_imagen' debe ser el mismo nombre que usas en el FormData de React
router.post('/crear', upload.single('url_imagen'), controllerImgDan.crearImagenDanos);

router.put('/modificar/:id', upload.single('url_imagen'), controllerImgDan.actImgDanos);
router.delete('/eliminar/:id', controllerImgDan.eliminarImgDano);

export default router;