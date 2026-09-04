import express from 'express';
const router = express.Router();
import controller from './prodtsUseService.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

// RN-001: solo el Administrador ve el listado completo
router.get('/listar', validarToken(["Administrador"]), controller.listarInsumosUsadosAdmin);

// RN-002 / RN-003: solo el Técnico ve sus propios insumos (el Cliente queda excluido)
router.get('/mis-insumos', validarToken(["Técnico"]), controller.listarMisInsumos);

// HU-006.9: agregar / quitar insumos de una orden (Cotización) -- solo el Técnico asignado
router.post('/agregar', validarToken(["Técnico"]), controller.agregarInsumoAOrden);
router.delete('/quitar/:id_insumos_orden', validarToken(["Técnico"]), controller.quitarInsumoDeOrden);

export default router;