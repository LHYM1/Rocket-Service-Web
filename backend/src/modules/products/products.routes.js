const express = require('express');
const router = express.Router();
const controllerProdt = require('./products.controller');

// Rutas para insumos
router.get('/listar', controllerProdt.listarInsumo);
router.get('/consultar/:id', controllerProdt.obtenerInsumo);
router.post('/crear', controllerProdt.crearInsumo);
router.put('/modificar/:id', controllerProdt.actualizarInsumo);
router.delete('/eliminar/:id', controllerProdt.eliminarInsumo);

module.exports = router;

