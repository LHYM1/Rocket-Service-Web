//configuración .env para JWT
require('dotenv').config();

const express = require('express');
const mysql = require('mysql2');
const cors = require('cors'); // permite acceso a la API desde el frontend
const authRoutes = require('./modules/auth/auth.routes');

const userRoutes = require('./modules/users/usuarios.routes');
const rolesRoutes = require('./modules/roles/roles.routes');
const ordersRoutes = require('./modules/orders/orders.routes');
const typeServRoutes = require('./modules/typeService/type.service.routes');
const productsRoutes = require('./modules/products/products.routes');


const app = express();

app.use(express.json());
app.use(cors()); // permite acceso a la API desde el frontend

// Rutas usuario
app.use('/api/usuarios', userRoutes);

// Rutas para clasificación de usuarios
app.use('/api/clasificacion_de_usuarios', rolesRoutes);

// Ruta para ordenes
app.use('/api/ordenes_de_servicio', ordersRoutes);

// Ruta para tipo de servicio
app.use('/api/tipo_servicio', typeServRoutes);

// Ruta para insumos
app.use('/api/insumos', productsRoutes);


// Rutas autenticación
app.use('/api/auth', authRoutes);

module.exports = app;
