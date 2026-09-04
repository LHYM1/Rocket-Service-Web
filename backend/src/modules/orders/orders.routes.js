import express from 'express';
const router = express.Router();
import controllerOrders from './orders.controller.js';

// Rutas para usuarios
router.get('/listar', controllerOrders.listarOrden);
router.get('/detalle', controllerOrders.listarOrdenesDetalle);  // detalle de órdenes   
router.get('/estadisticas', controllerOrders.obtenerEstadisticas); // conteo de órdenes
router.get('/consultar/:id', controllerOrders.obtenerOrden);
router.post('/crear', controllerOrders.crearOrden);
router.put('/modificar/:id', controllerOrders.actualizarOrden);   
router.put('/asignar/:id_orden', controllerOrders.asignarTecnico); // Asignar técnico 
router.delete('/eliminar/:id', controllerOrders.eliminarOrden);

export default router;