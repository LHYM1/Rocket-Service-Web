import usuarios from './usuarios.model.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { enviarTokenTecnico, enviarTokenCliente } from '../../helpers/emailService.js';

const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const regexSoloLetras = /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ]+$/;
const regexTelefono = /^\d{10}$/;

const normalizarNombre = (texto) => {
    if (!texto) return texto;
    const limpio = texto.trim();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
};

const formatearFechaMYSQL = (fecha) => {
    return fecha.toString().slice(0, 19).replace('T', ' ');
}

const TECNICO_TOKEN_VIGENCIA_MS = 10 * 60 * 1000; // 10 minutos
const CLIENTE_TOKEN_VIGENCIA_MS = 24 * 60 * 60 * 1000; // 24 horas

const generarCodigo6Digitos = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

const esRolAdministrador = async (id_tipo_usuario) => {
    if (!id_tipo_usuario) return false;
    const [rows] = await pool.query(
        'SELECT categoria_usuario FROM clasificacion_de_usuarios WHERE id_tipo_usuario = ?',
        [id_tipo_usuario]
    );
    if (rows.length === 0) return false;
    return rows[0].categoria_usuario.toLowerCase().includes('admin');
};

export const listarUsuario = async (req, res) => {
    try {
        const users = await usuarios.findAll();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
};

export const obtenerUsuario = async (req, res) => {
    try {
        const user = await usuarios.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

export const verificarCorreo = async (req, res) => {
    const { correo_usuario } = req.query;

    if (!correo_usuario) {
        return res.status(400).json({ message: "Correo no proporcionado" });
    }

    if (!regexEmail.test(correo_usuario)) {
        return res.json({ valido: false, motivo: "formato_invalido" });
    }

    try {
        const usuarioExistente = await usuarios.findByEmail(correo_usuario);
        if (usuarioExistente) {
            return res.json({ valido: false, motivo: "duplicado" });
        }
        return res.json({ valido: true });
    } catch (error) {
        console.error("ERROR VERIFICAR CORREO:", error);
        res.status(500).json({ message: "Error al verificar el correo" });
    }
};

// 1. CREACIÓN DEL CLIENTE (Recibe URL con Token de 24 Horas)
export const crearCliente = async (req, res) => {
    try {
        const { nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario } = req.body;

        if (!nombre || !apellido || !correo_usuario || !telefono_usuario || !id_tipo_usuario) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        if (await esRolAdministrador(id_tipo_usuario)) {
            return res.status(403).json({ 
                message: "No está permitido crear usuarios Administradores por este medio." 
            });
        }

        if (!regexEmail.test(correo_usuario)) {
            return res.status(400).json({ message: "El formato del correo no es válido." });
        }

        if (!regexSoloLetras.test(nombre.trim()) || !regexSoloLetras.test(apellido.trim())) {
            return res.status(400).json({ message: "El nombre y apellido solo deben contener letras." });
        }

        if (!regexTelefono.test(telefono_usuario.trim())) {
            return res.status(400).json({ 
                message: "El teléfono debe contener exactamente 10 dígitos numéricos." 
            });
        }

        const existente = await usuarios.findByEmail(correo_usuario);
        if (existente) {
            return res.status(409).json({ message: "Este correo ya está registrado." });
        }

        // Crear registro en la tabla usuarios (campos vacíos en lugar de null)
        const clienteCreado = await usuarios.create({
            nombre: normalizarNombre(nombre),
            apellido: normalizarNombre(apellido),
            correo_usuario,
            telefono_usuario: telefono_usuario.trim(),
            contrasena: '',
            id_tipo_usuario,
            estado: 1
        });

        const id_usuario = clienteCreado.insertId;

        // Generar JWT
        const tokenCliente = jwt.sign(
            { id_usuario, correo: correo_usuario },
            process.env.JWT_SECRET || 'secreto_rocket_service',
            { expiresIn: '24h' }
        );

        // Registrar token en la base de datos
        const expiracion = new Date(Date.now() + CLIENTE_TOKEN_VIGENCIA_MS);
        await usuarios.createToken({
            id_usuario,
            token: tokenCliente,
            tipo_token: 'REGISTRO',
            fecha_expiracion: expiracion
        });

        // Enviar únicamente el enlace dinámico al cliente
        const urlCliente = `${process.env.FRONTEND_URL}/establecer-contrasena?token=${tokenCliente}`;
        await enviarTokenCliente(correo_usuario, urlCliente);

        res.status(201).json({
            message: "Cliente creado correctamente. Se ha enviado el enlace de activación al correo.",
        });

    } catch (error) {
        console.error("ERROR CREAR CLIENTE:", error);
        res.status(500).json({ message: "Error al crear cliente" });
    }
};

// 2. INVITACIÓN DE TÉCNICO (Recibe únicamente el código numérico de 6 dígitos)
export const invitarTecnico = async (req, res) => {
    const { correo_usuario, id_tipo_usuario } = req.body;

    if (!correo_usuario || !id_tipo_usuario) {
        return res.status(400).json({ message: "El correo y el tipo de usuario son obligatorios." });
    }

    if (await esRolAdministrador(id_tipo_usuario)) {
        return res.status(403).json({ 
            message: "No está permitido invitar usuarios Administradores por este medio." 
        });
    }

    if (!regexEmail.test(correo_usuario)) {
        return res.status(400).json({ message: "El formato del correo no es válido." });
    }

    try {
        const existente = await usuarios.findByEmail(correo_usuario);
        if (existente) {
            return res.status(409).json({ message: "Este correo ya está registrado." });
        }

        const codigo = generarCodigo6Digitos();
        const salt = await bcrypt.genSalt(10);
        const codigoHash = await bcrypt.hash(codigo, salt);
        const expiracion = new Date(Date.now() + TECNICO_TOKEN_VIGENCIA_MS);

        // Crear usuario técnico en estado pendiente (campos vacíos)
        const tecnicoCreado = await usuarios.create({
            nombre: '',
            apellido: '',
            correo_usuario,
            telefono_usuario: '',
            contrasena: '',
            id_tipo_usuario,
            estado: 1
        });

        const id_usuario = tecnicoCreado.insertId;

        // Guardar el HASH del código de 6 dígitos en tokens_autenticacion
        await usuarios.createToken({
            id_usuario,
            token: codigoHash,
            tipo_token: 'REGISTRO',
            fecha_expiracion: expiracion
        });

        // Se envía ÚNICAMENTE el PIN de 6 dígitos (NO se envía URL ni token en el enlace)
        await enviarTokenTecnico(correo_usuario, codigo);

        return res.status(201).json({
            message: "Técnico registrado. Se ha enviado el código de activación al correo, válido por 10 minutos."
        });

    } catch (error) {
        console.error("Error al invitar técnico:", error);

        if (error.code === 'ER_DUP_ENTRY' || error.errno === 1062) {
            return res.status(409).json({ message: "Este correo ya está registrado." });
        }

        return res.status(500).json({ message: "Error al procesar la invitación del técnico." });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        let datosAActualizar = { ...req.body };

        if (datosAActualizar.id_tipo_usuario && await esRolAdministrador(datosAActualizar.id_tipo_usuario)) {
            return res.status(403).json({ 
                message: "No está permitido asignar el rol Administrador a un usuario." 
            });
        }

        if (datosAActualizar.nombre) {
            if (!regexSoloLetras.test(datosAActualizar.nombre.trim())) {
                return res.status(400).json({ message: "El nombre solo debe contener letras." });
            }
            datosAActualizar.nombre = normalizarNombre(datosAActualizar.nombre);
        }
        if (datosAActualizar.apellido) {
            if (!regexSoloLetras.test(datosAActualizar.apellido.trim())) {
                return res.status(400).json({ message: "El apellido solo debe contener letras." });
            }
            datosAActualizar.apellido = normalizarNombre(datosAActualizar.apellido);
        }

        if (datosAActualizar.telefono_usuario) {
            if (!regexTelefono.test(datosAActualizar.telefono_usuario.trim())) {
                return res.status(400).json({ 
                    message: "El teléfono debe contener exactamente 10 dígitos numéricos." 
                });
            }
            datosAActualizar.telefono_usuario = datosAActualizar.telefono_usuario.trim();
        }

        if (req.body.contrasena) {
            const salt = await bcrypt.genSalt(10);
            datosAActualizar.contrasena = await bcrypt.hash(req.body.contrasena, salt);
        } else {
            delete datosAActualizar.contrasena;
        }

        const actualizado = await usuarios.update(req.params.id, datosAActualizar);

        if (!actualizado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        res.json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        console.error("ERROR ACTUALIZAR:", error);
        res.status(500).json({ error: error.message });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const eliminado = await usuarios.remove(req.params.id);
        if (!eliminado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario desactivado correctamente" });
    } catch (error) {
        console.error("ERROR DESACTIVAR:", error);
        res.status(500).json({ error: error.message });
    }
};

export const restaurarUsuario = async (req, res) => {
    try {
        const restaurado = await usuarios.restaurar(req.params.id);
        if (!restaurado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario activado correctamente" });
    } catch (error) {
        console.error("ERROR ACTIVAR:", error);
        res.status(500).json({ error: error.message });
    }
};

// Listar disponibilidad de técnicos (ocupado o disponible)
export const listarTecnicosDisponibilidad = async (req, res) => {
    try {
        const query = `
            SELECT 
                u.id_usuario AS id,
                CONCAT(u.nombre, ' ', u.apellido) AS nombre,
                CASE 
                    WHEN COUNT(o.id_orden) > 0 THEN 'Ocupado'
                    ELSE 'Disponible'
                END AS estado
            FROM usuarios u
            INNER JOIN clasificacion_de_usuarios c ON u.id_tipo_usuario = c.id_tipo_usuario
            LEFT JOIN ordenes_de_servicio o 
                ON o.id_tecnico_asignado = u.id_usuario
                AND o.id_estado_de_servicio IN (
                    SELECT id_estado_de_servicio FROM estado_de_orden_de_servicio 
                    WHERE nombre_estado NOT IN ('FINALIZADA', 'CANCELADA')
                )
            WHERE c.categoria_usuario = 'Técnico'
            GROUP BY u.id_usuario, u.nombre, u.apellido
        `;
        const [rows] = await db.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar disponibilidad de técnicos' });
    }
};

export default {
    listarUsuario,
    obtenerUsuario,
    verificarCorreo,
    crearCliente,
    actualizarUsuario,
    eliminarUsuario,
    restaurarUsuario,
    invitarTecnico,
    listarTecnicosDisponibilidad
};