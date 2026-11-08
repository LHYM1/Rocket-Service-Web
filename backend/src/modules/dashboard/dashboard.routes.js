import express from 'express';
const router = express.Router();
import controller from './dashboard.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

router.get('/resumen', validarToken(["Administrador"]), controller.obtenerResumen);

export default router;