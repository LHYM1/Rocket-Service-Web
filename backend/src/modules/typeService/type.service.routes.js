import express from 'express';
const router = express.Router();
import controllerTypeServ from './type.service.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Técnico y Admin pueden ver
router.get('/listar', validarToken, verificarRol(['Administrador', 'Técnico']), controllerTypeServ.listarTypeServ); 
router.get('/consultar/:id', validarToken, verificarRol(['Administrador', 'Técnico']), controllerTypeServ.obtenerTypeServ);

// Solo Admin puede modificar
router.post('/crear', validarToken, verificarRol(['Administrador']), controllerTypeServ.crearTypeServ);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador', 'Técnico']), controllerTypeServ.actTypeServ);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), controllerTypeServ.eliminarTypeServ);

export default router;