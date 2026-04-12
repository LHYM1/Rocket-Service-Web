import express from 'express';
const router = express.Router();
import controllerImgDan from './imgDanos.controller.js';

// Rutas para imagenes danos 
router.get('/listar', controllerImgDan.listarImgDanos);
router.get('/consultar/:id', controllerImgDan.ObtenerImgDanos);
router.post('/crear', controllerImgDan.crearImgDanos);
router.put('/modificar/:id', controllerImgDan.actImgDanos);    
router.delete('/eliminar/:id', controllerImgDan.eliminarImgDano);

export default router;