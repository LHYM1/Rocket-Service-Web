import express from 'express';
const router = express.Router();
import controllerUsers from './usuarios.controller.js';
import { validarToken, verificarRol } from '../../middlewares/authMiddleware.js';

router.get('/listar', validarToken, verificarRol(['Administrador']), controllerUsers.listarUsuario);
router.get('/consultar/:id', validarToken, verificarRol(['Administrador']), controllerUsers.obtenerUsuario);
router.post('/crear', validarToken, verificarRol(['Administrador']), controllerUsers.crearUsuario);
router.put('/modificar/:id', validarToken, verificarRol(['Administrador']), controllerUsers.actualizarUsuario);
router.put('/eliminar/:id', validarToken, verificarRol(['Administrador']), controllerUsers.eliminarUsuario);
router.put('/restaurar/:id', validarToken, verificarRol(['Administrador']), controllerUsers.restaurarUsuario);
router.get('/sin-moto', validarToken, verificarRol(['Administrador']), controllerUsers.listarUsuariosSinMoto);
router.get('/tecnicos-sin-orden', validarToken, verificarRol(['Administrador']), controllerUsers.listarTecnicosSinOrden);
router.get('/clientes-con-moto', validarToken, verificarRol(['Administrador']), controllerUsers.listarClientesConMoto);

export default router;