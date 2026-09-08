import express from 'express';
import modeloMotController from './modeloMot.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/listar', validarToken(["Administrador", "Técnico", "Cliente"]), modeloMotController.getModelos);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico", "Cliente"]), modeloMotController.obtenerModelo);
router.post('/crear', validarToken(["Administrador"]), modeloMotController.createModelo);
router.put('/modificar/:id', validarToken(["Administrador"]), modeloMotController.updateModelo);
router.patch('/desactivar/:id', validarToken(["Administrador"]), modeloMotController.deleteModelo);

export default router;