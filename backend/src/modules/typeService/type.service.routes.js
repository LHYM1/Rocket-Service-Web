import express from 'express';
const router = express.Router();
import controllerTypeServ from './type.service.controller.js';

router.get('/listar', controllerTypeServ.listarTypeServ); 
router.get('/consultar/:id', controllerTypeServ.obtenerTypeServ);
router.post('/crear', controllerTypeServ.crearTypeServ);
router.put('/modificar/:id', controllerTypeServ.actTypeServ);
router.delete('/eliminar/:id', controllerTypeServ.eliminarTypeServ);

export default router;