import express from 'express';
import insumosUsadosController from './prodtsUseService.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// RF-004.7 – Consultar insumos usados en servicio. Solo lectura, rol Administrador.
router.get('/listar', validarToken(["Administrador"]), insumosUsadosController.listarInsumosUsados);

export default router;