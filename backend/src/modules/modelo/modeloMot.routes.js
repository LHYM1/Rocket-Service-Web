import express from 'express';
const router = express.Router();
import modeloMotController from './modeloMot.controller.js';

// Rutas para registro de actividad 
router.get('/listar', modeloMotController.listarModeloMot);
router.get('/consultar/:id', modeloMotController.obtenerModelo);
router.post('/crear', modeloMotController.crearModelo);
router.put('/modificar/:id', modeloMotController.actualizarModeloMot);    
router.delete('/eliminar/:id', modeloMotController.eliminarModelo);

export default router;