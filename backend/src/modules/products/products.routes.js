import express from 'express';
const router = express.Router();
import controllerProdt from './products.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

// Rutas para insumos
// RN-001 / CA-006: solo el Administrador puede consultar insumos
router.get('/listar', validarToken(["Administrador"]), controllerProdt.listarInsumo);
router.get('/consultar/:id', validarToken(["Administrador"]), controllerProdt.obtenerInsumo);

// RN-004 / CA-006: solo el Administrador puede registrar insumos
router.post('/crear', validarToken(["Administrador"]), controllerProdt.crearInsumo);

// RN-001 / CA-007: solo el Administrador puede actualizar insumos
router.put('/modificar/:id', validarToken(["Administrador"]), controllerProdt.actualizarInsumo);
router.delete('/eliminar/:id', controllerProdt.eliminarInsumo);

export default router;