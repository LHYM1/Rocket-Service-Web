import express from 'express';
const router = express.Router();
import controllerUsers from './usuarios.controller.js';

router.get('/listar', controllerUsers.listarUsuario);
router.get('/consultar/:id', controllerUsers.obtenerUsuario);
router.post('/crear', controllerUsers.crearUsuario);
router.put('/modificar/:id', controllerUsers.actualizarUsuario);
router.put('/eliminar/:id', controllerUsers.eliminarUsuario);
router.put('/restaurar/:id', controllerUsers.restaurarUsuario);

export default router;