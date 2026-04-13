import express from 'express';
const router = express.Router();
import motController from './mot.controller.js';

// Rutas para registro de actividad 
router.get('/listar', motController.listarMotocicleta);
router.get('/consultar/:id', motController.obtenerMoto);
router.post('/crear', motController.crearMoto);
router.put('/modificar/:id', motController.actualizarMot);    
router.delete('/eliminar/:id', motController.eliminarMoto);

export default router;