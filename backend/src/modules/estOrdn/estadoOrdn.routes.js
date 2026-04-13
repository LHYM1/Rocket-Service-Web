import express from 'express';
const router = express.Router();
import estdOrdenController from './estadoOrdn.controller.js';

// Rutas para registro de actividad 
router.get('/listar', estdOrdenController.listarEstdOrden);
router.get('/consultar/:id', estdOrdenController.obtenerEstdOrden);
router.post('/crear', estdOrdenController.crearEstdOrden);
router.put('/modificar/:id', estdOrdenController.actualizarEstOrden);    
router.delete('/eliminar/:id', estdOrdenController.eliminarEstdOrd);

export default router;