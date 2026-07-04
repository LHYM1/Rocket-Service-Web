import express from 'express';
const router = express.Router();
import motController from './mot.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Rutas para registro de actividad 
router.get('/listar', validarToken, verificarRol(['Administrador']), motController.listarMotocicleta);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), motController.obtenerMoto);
router.post('/crear', validarToken, verificarRol(['Administrador']), motController.crearMoto);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), motController.actualizarMot);    
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), motController.eliminarMoto);
router.get('/por-usuario/:idUsuario', validarToken, verificarRol(['Administrador']), motController.obtenerMotoPorUsuario);

export default router;