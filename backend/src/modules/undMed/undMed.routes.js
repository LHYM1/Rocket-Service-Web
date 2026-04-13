import express from 'express';
const router = express.Router();
import unidMedController from './undMed.controller.js';

// Rutas para unidades de medida (insumos)
router.get('/listar', unidMedController.listarUnidadMedida);
router.get('/consultar/:id', unidMedController.obtenerUnidadMed);
router.post('/crear', unidMedController.crearUnidadMed);
router.put('/modificar/:id', unidMedController.actualizarUnidadMed);    
router.delete('/eliminar/:id', unidMedController.eliminarUnidMed);

export default router;