import express from 'express';
const router = express.Router();
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';
import ordersController from './orders.controller.js';

// Técnico y Admin pueden ver
router.get('/listar', validarToken, verificarRol(['Administrador', 'Técnico']), ordersController.listarOrden); 
router.get('/consultar/:id', validarToken, verificarRol(['Administrador', 'Técnico']), ordersController.obtenerOrden);

// Solo Admin puede modificar
router.post('/crear', validarToken, verificarRol(['Administrador']), ordersController.crearOrden);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), ordersController.actualizarOrden);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), ordersController.eliminarOrden);

// Técnico ve solo sus órdenes
router.get('/mis-ordenes', validarToken, verificarRol(['Técnico']), ordersController.listarMisOrdenes);

router.put('/actualizar-estado/:id', validarToken, verificarRol(['Técnico', 'Administrador']), ordersController.actualizarEstadoOrden);

router.put('/actualizar-estado-tecnico/:idTecnico', validarToken, verificarRol(['Técnico']), ordersController.actualizarEstadoPorTecnico);

router.put('/terminar-revision/:id', validarToken, verificarRol(['Técnico']), ordersController.terminarRevision);

export default router;