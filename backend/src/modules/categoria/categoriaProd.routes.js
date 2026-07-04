import express from 'express';
const router = express.Router();
import categoriaInsumo from './categoriaProd.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Rutas para registro de actividad 
router.get('/listar', validarToken, verificarRol(['Administrador']), categoriaInsumo.listarCatInsumo);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), categoriaInsumo.obtenerCatgInsm); 
router.post('/crear', validarToken, verificarRol(['Administrador']), categoriaInsumo.crearCatgInsm);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), categoriaInsumo.actualizarCatInsumo);    
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), categoriaInsumo.eliminarCatgInsm);

export default router;