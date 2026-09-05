import express from 'express';
const router = express.Router();
import controller from './notificaciones.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

router.post('/crear', validarToken(["Administrador", "Técnico", "Cliente"]), controller.crearNotificacion);
router.get('/pendientes-admin', validarToken(["Administrador"]), controller.listarParaAdmin);
router.patch('/marcar-leidas', validarToken(["Administrador"]), controller.marcarLeidas);

export default router;