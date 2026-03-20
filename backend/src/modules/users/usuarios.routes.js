const express = require('express');
const router = express.Router();
const controllerUsers = require('./users/usuarios.controller');

// Rutas para usuarios
router.get('/listar', controllerUsers.listarUsuario);
router.get('/consultar/:id', controllerUsers.obtenerUsuario);
router.post('/crear', controllerUsers.crearUsuario);
router.put('/modificar/:id', controllerUsers.actualizarUsuario);
router.delete('/eliminar/:id', controllerUsers.eliminarUsuario);

module.exports = router;

