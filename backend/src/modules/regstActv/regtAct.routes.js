import express from 'express';
const router = express.Router();
import controllerRegActv from './regActv.controller.js';

// Rutas para registro de actividad 
router.get('/listar', controllerRegActv.listarRegAct);
router.get('/consultar/:id', controllerRegActv.obtenerRegAct);
router.post('/crear', controllerRegActv.crearRegAct);
router.put('/modificar/:id', controllerRegActv.actualizarRegAct);    
router.delete('/eliminar/:id', controllerRegActv.eliminarRegAct);

export default router;