import express from 'express';
const router = express.Router();
import estdOrdenController from './estadoOrdn.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';


    router.get('/listar', validarToken, verificarRol(['Administrador']), estdOrdenController.listarEstdOrden);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), estdOrdenController.obtenerEstdOrden);
router.post('/crear', validarToken, verificarRol(['Administrador']), estdOrdenController.crearEstdOrden);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), estdOrdenController.actualizarEstOrden);
router.delete('/eliminar/:id', validarToken, verificarRol(['Administrador']), estdOrdenController.eliminarEstdOrd);


export default router;