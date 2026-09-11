import express from 'express';
import categoriaInsumo from './categoriaProd.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

const router = express.Router();

// Roles según RF-010 (Gestión de categorías de insumos)
router.get('/listar', validarToken(["Administrador", "Técnico", "Cliente"]), categoriaInsumo.listarCatInsumo);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico", "Cliente"]), categoriaInsumo.obtenerCatgInsm);
router.post('/crear', validarToken(["Administrador"]), categoriaInsumo.crearCatgInsm);
router.put('/modificar/:id', validarToken(["Administrador"]), categoriaInsumo.actualizarCatInsumo);
router.put('/estado/:id', validarToken(["Administrador"]), categoriaInsumo.cambiarEstadoCatInsumo);

export default router;