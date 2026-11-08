import { Router } from 'express';
import tokenController from './token.controller.js';

const router = Router();

// Acceder directamente mediante el objeto tokenController
router.get('/validar/:token', tokenController.validarEstadoToken);
router.post('/establecer-contrasena-cliente', tokenController.consumirTokenCliente);

export default router;