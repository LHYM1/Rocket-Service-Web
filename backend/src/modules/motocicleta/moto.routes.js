import express from 'express';
import motController from './mot.controller.js';

const router = express.Router();

router.get('/listar', motController.listarMotocicleta);
router.get('/consultar/:id', motController.obtenerMoto);
router.post('/crear', motController.crearMoto);
router.put('/modificar/:id', motController.actualizarMot);    
router.delete('/eliminar/:id', motController.eliminarMoto);

export default router;