const express = require("express");
const { login } = require("./auth.controller")
const { verifyRole } = require("../../middlewares/authMiddleware");

const router = express.Router();

// Ruta login
router.post("/login", login);

// Ruta register
router.post("/register", login)

// Ruta protegida solo para admin
router.get("/admin-data", verifyRole(["admin"]), (req, res) => {
    res.json({ 
        message: "Bienvenido administrador", 
        user: req.user 
    });
})

// Ruta protegida para técnico
router.get("/tec-data", verifyRole(["user", "admin"]), (req, res) => {
    res.json({ 
        message: "Bienvenido Técnico", 
        user: req.user 
    });
});

module.exports = router;    