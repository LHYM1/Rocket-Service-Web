import express from 'express';
const router = express.Router();
import controllerRegActv from './regActv.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Técnico y Admin pueden ver
router.get('/listar', validarToken, verificarRol(['Administrador', 'Técnico']), controllerRegActv.listarRegAct); 
router.get('/consultar/:id', validarToken, verificarRol(['Administrador', 'Técnico']), controllerRegActv.obtenerRegAct);

// Solo Admin puede modificar
router.post('/crear', validarToken, verificarRol(['Administrador']), controllerRegActv.crearRegAct);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), controllerRegActv.actualizarRegAct);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), controllerRegActv.eliminarRegAct);
router.put('/actualizar-disponibilidad/:idUsuario', validarToken, verificarRol(['Técnico']), controllerRegActv.actualizarDisponibilidad);

router.get('/disponibilidad/:idUsuario', validarToken, verificarRol(['Técnico', 'Administrador']), controllerRegActv.obtenerDisponibilidad);

export default router;
