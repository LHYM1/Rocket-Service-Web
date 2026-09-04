import express from 'express';
const router = express.Router();
import controllerOrders from './orders.controller.js';
import { validarToken } from '../../middlewares/authMiddleware.js';

// HU-006.2 / RN-005: Admin, Técnico y Cliente consultan (cada uno ve lo suyo, filtrado en el controller)
router.get('/listar', validarToken(["Administrador", "Técnico", "Cliente"]), controllerOrders.listarOrden);
// Alias que ya usa el frontend del Técnico -- misma lógica que /listar
router.get('/mis-ordenes', validarToken(["Técnico"]), controllerOrders.listarOrden);
router.get('/consultar/:id', validarToken(["Administrador", "Técnico", "Cliente"]), controllerOrders.obtenerOrden);
router.get('/tecnicos-disponibles', validarToken(["Administrador"]), controllerOrders.listarTecnicosDisponibles);

// HU-006.1 / RN-001: solo el Administrador crea órdenes
router.post('/crear', validarToken(["Administrador"]), controllerOrders.crearOrden);

// HU-006.3 / RN-001, RN-002: Admin y Técnico actualizan (permisos de campo validados en el controller)
router.put('/modificar/:id', validarToken(["Administrador", "Técnico"]), controllerOrders.actualizarOrden);

// HU-006.7: transiciones de estado exclusivas del Técnico asignado
router.patch('/aceptar/:id', validarToken(["Técnico"]), controllerOrders.aceptarOrden);
router.patch('/enviar-cotizacion/:id', validarToken(["Técnico"]), controllerOrders.enviarCotizacion);
router.patch('/finalizar/:id', validarToken(["Técnico"]), controllerOrders.finalizarOrden);

// HU-006.10: el Cliente aprueba o rechaza la cotización
router.patch('/aprobar/:id', validarToken(["Cliente"]), controllerOrders.aprobarCotizacion);
router.patch('/rechazar/:id', validarToken(["Cliente"]), controllerOrders.rechazarCotizacion);

// HU-006.4: solo el Administrador cancela órdenes (reemplaza el DELETE físico)
router.patch('/cancelar/:id', validarToken(["Administrador"]), controllerOrders.cancelarOrden);

export default router;