import express from 'express';
const router = express.Router();
import controllerProdt from './products.controller.js';

// Rutas para insumos
router.get('/listar', controllerProdt.listarInsumo);
router.get('/consultar/:id', controllerProdt.obtenerInsumo);
router.post('/crear', controllerProdt.crearInsumo);
router.put('/modificar/:id', controllerProdt.actualizarInsumo);
router.patch('/desactivar/:id', controllerProdt.desactivarInsumo);
router.patch('/reactivar/:id', controllerProdt.reactivarInsumo);

export default router;