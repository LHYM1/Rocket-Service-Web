import express from 'express';
const router = express.Router();
import insumoController from './insumos.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

router.get('/listar', validarToken, verificarRol(['Administrador', 'Técnico']), insumoController.listarInsumos);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), insumoController.obtenerInsumo);
router.post('/crear', validarToken, verificarRol(['Administrador']), insumoController.crearInsumo);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), insumoController.actualizarInsumo);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), insumoController.eliminarInsumo);

export default router;