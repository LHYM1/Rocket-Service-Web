import express from 'express';
const router = express.Router();
import controller from './calificaciones.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

// RN-001: solo el Cliente califica
router.post('/calificar/:id_orden', validarToken(["Cliente"]), controller.calificarServicio);

// Consultas (cualquier rol autenticado puede necesitarlas para mostrar UI)
router.get('/orden/:id_orden', validarToken(["Administrador", "Técnico", "Cliente"]), controller.obtenerCalificacionDeOrden);
router.get('/promedio/:id_tecnico', validarToken(["Administrador", "Técnico", "Cliente"]), controller.obtenerPromedioTecnico);

export default router;