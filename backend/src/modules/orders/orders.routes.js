const express = require('express');
const router = express.Router();
const controllerOrders = require('./orders.controller');

// Rutas para usuarios
router.get('/listar', controllerOrders.listarOrden);
router.get('/consultar/:id', controllerOrders.obtenerOrden);
router.post('/crear', controllerOrders.crearOrden);
router.put('/modificar/:id', controllerOrders.actualizarOrden);    
router.delete('/eliminar/:id', controllerOrders.eliminarOrden);

module.exports = router;