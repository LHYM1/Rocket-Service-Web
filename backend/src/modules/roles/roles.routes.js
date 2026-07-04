import express from 'express';
const router = express.Router();
import controllerRoles from './roles.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Rutas para usuarios
router.get('/listar', validarToken, verificarRol(['Administrador']), controllerRoles.listarCatUser);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), controllerRoles.obtenerCatUser);
router.post('/crear', validarToken, verificarRol(['Administrador']), controllerRoles.crearCatUser);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), controllerRoles.actuaCatUser);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), controllerRoles.eliminarCatUser);

export default router;
