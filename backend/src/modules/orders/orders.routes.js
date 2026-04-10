import express from 'express';
const router = express.Router();
import controllerOrders from './orders.controller.js';

// Rutas para usuarios
router.get('/listar', controllerOrders.listarOrden);
router.get('/consultar/:id', controllerOrders.obtenerOrden);
router.post('/crear', controllerOrders.crearOrden);
router.put('/modificar/:id', controllerOrders.actualizarOrden);    
router.delete('/eliminar/:id', controllerOrders.eliminarOrden);

export default router;