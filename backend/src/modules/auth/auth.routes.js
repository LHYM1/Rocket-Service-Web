import express from "express";
import authController from "./auth.controller.js";
import { validarToken } from "../../middlewares/authMiddleware.js";

const { login, register } = authController;
const router = express.Router();

router.post("/login", login);

router.post("/register", register)

router.get("/admin-data", validarToken(["Administrador"]), (req, res) => {
    res.json({ 
        message: "Bienvenido administrador", 
        user: req.user 
    });
})

router.get("/tec-data", validarToken(["Técnico", "Administrador"]), (req, res) => {
    res.json({ 
        message: "Bienvenido Técnico", 
        user: req.user 
    });
});

export default router;