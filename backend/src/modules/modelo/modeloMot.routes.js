import express from 'express';
const router = express.Router();
import modeloMotController from './modeloMot.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Rutas para registro de actividad 
router.get('/listar', validarToken, verificarRol(['Administrador']), modeloMotController.listarModeloMot);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), modeloMotController.obtenerModelo);
router.post('/crear', validarToken, verificarRol(['Administrador']), modeloMotController.crearModelo);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), modeloMotController.actualizarModeloMot);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), modeloMotController.eliminarModelo);

export default router;