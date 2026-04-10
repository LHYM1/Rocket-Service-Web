import express from 'express';
const router = express.Router();
import controllerProdt from './products.controller.js';

// Rutas para insumos
router.get('/listar', controllerProdt.listarInsumo);
router.get('/consultar/:id', controllerProdt.obtenerInsumo);
router.post('/crear', controllerProdt.crearInsumo);
router.put('/modificar/:id', controllerProdt.actualizarInsumo);
router.delete('/eliminar/:id', controllerProdt.eliminarInsumo);

export default router;

