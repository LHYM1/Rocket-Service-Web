import express from 'express';
const router = express.Router();
import controller from './preRevision.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';
import upload from '../../middlewares/multer.js';

// RN-001: solo el Admin crea pre-revisiones
router.post('/crear', validarToken(["Administrador"]), controller.crearPreRevision);

// Admin y Técnico consultan (cada uno ve lo suyo, filtrado en el controller)
router.get('/listar', validarToken(["Administrador", "Técnico"]), controller.listarPreRevision);
router.get('/pendientes-orden', validarToken(["Administrador"]), controller.listarPendientesDeOrden);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico"]), controller.obtenerPreRevision);

// Solo el Técnico agrega fotos y completa el resultado (validado también en el controller)
router.post('/:id/fotos', validarToken(["Técnico"]), upload.single('foto'), controller.agregarFotoPreRevision);
router.delete('/fotos/:id_foto', validarToken(["Técnico"]), controller.eliminarFotoPreRevision);
router.patch('/completar/:id', validarToken(["Técnico"]), controller.completarPreRevision);

// Utilidad para pruebas: solo Admin, solo pre-revisiones PENDIENTE
router.delete('/eliminar/:id', validarToken(["Administrador"]), controller.eliminarPreRevision);

export default router;