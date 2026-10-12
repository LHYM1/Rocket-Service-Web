import express from 'express';
const router = express.Router();
import controller from './notificaciones.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

router.post('/crear', validarToken(["Administrador", "Técnico", "Cliente"]), controller.crearNotificacion);
router.get('/pendientes-admin', validarToken(["Administrador"]), controller.listarParaAdmin);
router.patch('/marcar-leidas', validarToken(["Administrador"]), controller.marcarLeidas);

// Notificaciones por orden -- para el badge de "Evidencias" del Cliente
router.get('/no-leidas-por-orden', validarToken(["Cliente"]), controller.obtenerNoLeidasPorOrden);
router.patch('/marcar-leidas-orden/:id_orden', validarToken(["Cliente"]), controller.marcarLeidasDeOrden);

export default router;