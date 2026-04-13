import express from 'express';
const router = express.Router();
import categoriaInsumo from './categoriaProd.controller.js';

// Rutas para registro de actividad 
router.get('/listar', categoriaInsumo.listarCatInsumo);
router.get('/consultar/:id', categoriaInsumo.obtenerCatgInsm); 
router.post('/crear', categoriaInsumo.crearCatgInsm);
router.put('/modificar/:id', categoriaInsumo.actualizarCatInsumo);    
router.delete('/eliminar/:id', categoriaInsumo.eliminarCatgInsm);

export default router;