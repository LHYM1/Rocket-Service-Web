import express from 'express';
const router = express.Router();
import controllerInsUServ from './prodtsUseServ.controller.js';

router.get('/listar', controllerInsUServ.listarInsUsedServ); 
router.get('/consultar/:id', controllerInsUServ.obtenerInsUsedServ);
router.post('/crear', controllerInsUServ.crearInsUsedServ);
router.put('/modificar/:id', controllerInsUServ.actInsUsedServ);
router.delete('/eliminar/:id', controllerInsUServ.eliminarInsedServ);

export default router;