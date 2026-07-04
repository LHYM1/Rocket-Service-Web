import express from 'express';
const router = express.Router();
import controllerInsUServ from './prodtsUseServ.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

// Listar todos (admin)
router.get('/listar', validarToken, verificarRol(['Administrador', 'Técnico']), controllerInsUServ.listarInsUsedServ);

// Listar solo los del técnico logueado
router.get('/mis-insumos', validarToken, verificarRol(['Técnico']), controllerInsUServ.listarMisInsumos);

router.get('/consultar/:id', validarToken, verificarRol(['Administrador', 'Técnico']), controllerInsUServ.obtenerInsUsedServ);
router.get('/por-orden/:idOrden', validarToken, verificarRol(['Administrador', 'Técnico']), controllerInsUServ.obtenerInsumosPorOrden);

router.post('/crear', validarToken, verificarRol(['Administrador', 'Técnico']), controllerInsUServ.crearInsUsedServ);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), controllerInsUServ.actInsUsedServ);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), controllerInsUServ.eliminarInsedServ);

export default router;