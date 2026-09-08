import express from 'express';
import motController from './mot.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/listar', validarToken(["Administrador"]), motController.getMotocicletas);
router.get('/sin-moto', validarToken(["Administrador", "Técnico"]), motController.getUsuariosSinMoto);
router.get('/consultar/placa/:placa', validarToken(["Administrador", "Técnico", "Cliente"]), motController.getByPlaca);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico", "Cliente"]), motController.getMotocicletaById);
router.post('/crear', validarToken(["Administrador"]), motController.createMotocicleta);
router.put('/modificar/:id', validarToken(["Administrador"]), motController.updateMotocicleta);    
router.put('/estado/:id', validarToken(["Administrador"]), motController.cambiarEstadoMotocicleta);

export default router;