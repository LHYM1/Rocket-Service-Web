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

import registActvRoutes from './modules/regstActv/regtAct.routes.js';
import imagenesDanos from './modules/imgDanos/img.routes.js';
import moto from './modules/motocicleta/moto.routes.js';
import modeloMot from './modules/modelo/modeloMot.routes.js';
import estadoOrden from './modules/estOrdn/estadoOrdn.routes.js';
import categoriaInsumos from './modules/categoria/categoriaProd.routes.js';
import unidadMedida from './modules/undMed/undMed.routes.js';   
import prodtsUseServiceRoutes from './modules/prodtsUseService/prodtsUseService.routes.js';
import preRevisionRoutes from './modules/preRevision/preRevision.routes.js';
import calificacionesRoutes from './modules/calificaciones/Calificaciones.routes.js'; 
import notificacionesRoutes from './modules/notificaciones/notificaciones.routes.js';
import tokenRoutes from './modules/tokens/token.routes.js';

const app = express();

app.use(express.json());
app.use(cors()); // permite acceso a la API desde el frontend

// Rutas usuario
app.use('/api/usuarios', userRoutes);
app.use('/api/tokens', tokenRoutes);

// Rutas para clasificación de usuarios
app.use('/api/clasificacion_de_usuarios', rolesRoutes);
app.use('/api/registro_actividad', registActvRoutes); // Ruta para registro actividad Tecs

// Ruta para ordenes
app.use('/api/ordenes_de_servicio', ordersRoutes);
app.use('/api/estado_de_orden_de_servicio', estadoOrden); // Ruta estado orden servicio


// Ruta para tipo de servicio
app.use('/api/tipo_servicio', typeServRoutes);

// Ruta para insumos
app.use('/api/insumos', productsRoutes);

// Ruta para imagenes daños
app.use('/api/imagenes_danos', imagenesDanos)
app.use('/uploads', express.static('uploads'));

// Ruta para motocicleta
app.use('/api/motocicleta', moto); 
app.use('/api/categoria', categoriaInsumos); // Ruta para categoria insumos

// Ruta para modelo motocicleta
app.use('/api/modelo', modeloMot); // Ruta para modelo

// Ruta para unidad de medida
app.use('/api/unidad_de_medida', unidadMedida); 


// Rutas autenticación
app.use('/api/auth', authRoutes);

// Ruta para insumos usados en servicio
app.use('/api/insumos_usados_en_servicio', prodtsUseServiceRoutes);

app.use('/api/pre_revision', preRevisionRoutes);

app.use('/api/calificaciones', calificacionesRoutes);

app.use('/api/notificaciones', notificacionesRoutes);

export default app;
