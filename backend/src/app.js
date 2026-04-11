//configuración .env para JWT
import 'dotenv/config';
import express from 'express';
import cors from 'cors'; // permite acceso a la API desde el frontend

import authRoutes from './modules/auth/auth.routes.js';
import userRoutes from './modules/users/usuarios.routes.js';
import rolesRoutes from './modules/roles/roles.routes.js';
import ordersRoutes from './modules/orders/orders.routes.js';
import typeServRoutes from './modules/typeService/type.service.routes.js';
import productsRoutes from './modules/products/products.routes.js';
import prodtsUseService from './modules/prodtsUseService/prodtsUseServ.routes.js'


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

// Ruta para insumos usados en servicio
app.use('api/insumosUsados')


// Rutas autenticación
app.use('/api/auth', authRoutes);

export default app;
