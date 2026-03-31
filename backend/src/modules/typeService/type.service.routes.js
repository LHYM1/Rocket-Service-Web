const express = require('express');
const router = express.Router();
const controllerTypeServ = require('./type.service.controller');

// rutas para tipo de servicio
router.get('/listar', controllerTypeServ.listarTypeServ);
router.get('/consultar/:id', controllerTypeServ.obtenerTypeServ);
router.post('/crear', controllerTypeServ.crearTypeServ);
router.put('/modificar/:id', controllerTypeServ.actTypeServ);
