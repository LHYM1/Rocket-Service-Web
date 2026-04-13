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

import registActvRoutes from './modules/regstActv/regtAct.routes.js';
import imagenesDanos from './modules/imgDanos/img.routes.js';

const app = express();

app.use(express.json());
app.use(cors()); // permite acceso a la API desde el frontend

// Rutas usuario
app.use('/api/usuarios', userRoutes);

// Rutas para clasificación de usuarios
app.use('/api/clasificacion_de_usuarios', rolesRoutes);
app.use('/api/registro_actividad', registActvRoutes); // Ruta para registro actividad Tecs

// Ruta para ordenes
app.use('/api/ordenes_de_servicio', ordersRoutes);
//app.use('/api/estado_orden_de_servicio', estOrdn); // Ruta estado orden servicio


// Ruta para tipo de servicio
app.use('/api/tipo_servicio', typeServRoutes);

// Ruta para insumos
app.use('/api/insumos', productsRoutes);

// Ruta para insumos usados en servicio
app.use('/api/insumos_usados_en_servicio', prodtsUseService);

// Ruta para imagenes daños

app.use('/api/imagenes_danos', imagenesDanos)
app.use('/uploads', express.static('uploads'));

// Ruta para motocicleta
//app.use('api/motocicleta', motocicleta); // Ruta motocicleta
//app.use('/api/categoria', categoria); // Ruta para categoria

// Ruta para modelo
//app.use('/api/modelo', modelo); // Ruta para modelo

// Ruta para unidad de medida
// app.use('/api/unidad_de_medida', undMed); // Ruta para unidad de medida



// Rutas autenticación
app.use('/api/auth', authRoutes);

export default app;
