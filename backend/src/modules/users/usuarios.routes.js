import express from 'express';
const router = express.Router();
import controllerUsers from './usuarios.controller.js';


router.get('/listar', controllerUsers.listarUsuario);
router.get('/consultar/:id', controllerUsers.obtenerUsuario);
router.put('/modificar/:id', controllerUsers.actualizarUsuario);
router.put('/eliminar/:id', controllerUsers.eliminarUsuario);
router.put('/restaurar/:id', controllerUsers.restaurarUsuario);
router.post('/invitar-tecnico', controllerUsers.invitarTecnico);
router.post('/invitar-cliente', controllerUsers.crearCliente);
router.get('/verificar-correo', controllerUsers.verificarCorreo);
router.post('/reenviar-token/:id', controllerUsers.reenviarToken);// Token registro


export default router;