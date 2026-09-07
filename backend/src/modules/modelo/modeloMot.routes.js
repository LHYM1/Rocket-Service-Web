import express from 'express';
const router = express.Router();
import modeloMotController from './modeloMot.controller.js';

router.get('/listar', modeloMotController.listarModeloMot);
router.get('/consultar/:id', modeloMotController.obtenerModelo);
router.post('/crear', modeloMotController.crearModelo);
router.put('/modificar/:id', modeloMotController.actualizarModeloMot);
router.patch('/desactivar/:id', modeloMotController.desactivarModelo);
router.patch('/reactivar/:id', modeloMotController.reactivarModelo);

export default router;