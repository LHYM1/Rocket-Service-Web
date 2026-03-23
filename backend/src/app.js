const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // permite acceso a la API desde el frontend
const authRoutes = require('./modules/auth/auth.routes');

const userRoutes = require('./modules/users/usuarios.routes');

const app = express();

app.use(express.json());
app.use(cors()); // permite acceso a la API desde el frontend

// Rutas usuario
app.use('/api/usuarios', userRoutes);

// Rutas para clasificación de usuarios
/*
app.use('/api/clasificacion_de_usuarios', userRoutes);
*/

// Rutas autenticación
app.use('/api/auth', authRoutes);

module.exports = app;
