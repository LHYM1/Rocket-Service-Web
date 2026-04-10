import express from 'express';
const router = express.Router();
import controllerRoles from './roles.controller.js';

// Rutas para usuarios
router.get('/listar', controllerRoles.listarCatUser);
router.get('/consultar/:id', controllerRoles.obtenerCatUser);
router.post('/crear', controllerRoles.crearCatUser);
router.put('/modificar/:id', controllerRoles.actuaCatUser);
router.delete('/eliminar/:id', controllerRoles.eliminarCatUser);

export default router;
