const express = require('express');
const router = express.Router();
const controllerRoles = require('./roles.controller');

// Rutas para usuarios
router.get('/listar', controllerRoles.listarCatUser);
router.get('/consultar/:id', controllerRoles.obtenerCatUser);
router.post('/crear', controllerRoles.crearCatUser);
router.put('/modificar/:id', controllerRoles.actuaCatUser);
router.delete('/eliminar/:id', controllerRoles.eliminarCatUser);

module.exports = router;
