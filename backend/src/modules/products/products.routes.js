import express from 'express';
const router = express.Router();
import controllerProdt from './products.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

// Rutas para insumos
// RN-001 / CA-006: el Administrador consulta; el Técnico también necesita ver el listado
// (para el selector de insumos en la Cotización, HU-006.9)

router.get('/listar', validarToken(["Administrador", "Técnico"]), controllerProdt.listarInsumo);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico"]), controllerProdt.obtenerInsumo);

// HU-004.6 / RN-005: solo el Administrador ve el stock bajo
router.get('/stock-bajo', validarToken(["Administrador"]), controllerProdt.obtenerStockBajos);

// RN-004 / CA-006: solo el Administrador puede registrar insumos
router.post('/crear', validarToken(["Administrador"]), controllerProdt.crearInsumo);

// RN-001 / CA-007: solo el Administrador puede actualizar insumos
router.put('/modificar/:id', validarToken(["Administrador"]), controllerProdt.actualizarInsumo);
router.delete('/eliminar/:id', controllerProdt.eliminarInsumo);

export default router;