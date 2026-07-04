import express from 'express';
const router = express.Router();
import unidMedController from './undMed.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Rutas para unidades de medida (insumos)
router.get('/listar', validarToken, verificarRol(['Administrador','Técnico']), unidMedController.listarUnidadMedida);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador','Técnico']), unidMedController.obtenerUnidadMed);
router.post('/crear', validarToken, verificarRol(['Administrador']), unidMedController.crearUnidadMed);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), unidMedController.actualizarUnidadMed);    
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), unidMedController.eliminarUnidMed);

export default router;