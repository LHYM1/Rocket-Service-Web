import express from "express";
import authController from "./auth.controller.js";
import { validarToken } from "../../middlewares/authMiddleware.js";

const { 
    login, 
    register, 
    verificarCorreo, 
    validarCodigoTecnico, 
    validarTokenCliente, 
    establecerContrasenaCliente 
} = authController;

const router = express.Router();

// Rutas de autenticación
router.post("/login", login); 
router.post("/register", register);
router.get("/verificar-correo", verificarCorreo);
router.get("/validar-token-cliente/:token", validarTokenCliente);
router.get("/validar-codigo-tecnico", validarCodigoTecnico);
router.post("/establecer-contrasena-cliente", establecerContrasenaCliente);

// Rutas protegidas por rol
router.get("/admin-data", validarToken(["Administrador"]), (req, res) => {
    res.json({ 
        message: "Bienvenido administrador", 
        user: req.user 
    });
});

router.get("/tec-data", validarToken(["Técnico", "Administrador"]), (req, res) => {
    res.json({ 
        message: "Bienvenido Técnico", 
        user: req.user 
    });
});

export default router;