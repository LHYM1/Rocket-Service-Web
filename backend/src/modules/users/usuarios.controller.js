import usuarios from './usuarios.model.js';
import pool from '../../config/db.js';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import { enviarTokenTecnico, enviarTokenCliente } from '../../helpers/emailService.js';
import { FormValidators } from '@rocket/shared';

const TECNICO_TOKEN_VIGENCIA_MS = 30 * 60 * 1000;
const CLIENTE_TOKEN_VIGENCIA_MS = 24 * 60 * 60 * 1000;

const generarCodigo6Digitos = () => crypto.randomInt(100000, 999999).toString();

const esRolAdministrador = async (id_tipo_usuario) => {
    if (!id_tipo_usuario) return false;
    const [rows] = await pool.query(
        'SELECT categoria_usuario FROM clasificacion_de_usuarios WHERE id_tipo_usuario = ?',
        [id_tipo_usuario]
    );
    if (rows.length === 0) return false;
    return rows[0].categoria_usuario.toLowerCase().includes('admin');
};

// Listar usuarios incluyendo mapeo del estado a Activo/Inactivo si la vista de React lo requiere como String
export const listarUsuario = async (req, res) => {
    try {
        const users = await usuarios.findAll();
        const usersMapped = users.map(u => ({
            ...u,
            estado_texto: u.estado === 2 || u.estado === '2' ? 'Activo' : 'Inactivo'
        }));
        res.json(usersMapped);
    } catch (error) {
        console.error("Error listar usuarios:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
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
        console.error("Error obtener usuario:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const verificarCorreo = async (req, res) => {
    const { correo_usuario } = req.query;

    if (!correo_usuario) {
        return res.status(400).json({ message: "Correo no proporcionado" });
    }

    if (!FormValidators.esEmailValido(correo_usuario)) {
        return res.status(400).json({ message: "Formato de correo inválido" });
    }

    try {
        const usuarioExistente = await usuarios.findByEmail(correo_usuario);
        return res.json({ valido: !usuarioExistente });
    } catch (error) {
        console.error("ERROR VERIFICAR CORREO:", error);
        res.status(500).json({ message: "Error al verificar el correo" });
    }
};

// Creación de cliente con ESTADO PENDIENTE (1) -- se activa cuando establece su contraseña
export const crearCliente = async (req, res) => {
    try {
        const { nombre, apellido, correo_usuario, telefono_usuario, id_tipo_usuario } = req.body;

        if (!nombre || !apellido || !correo_usuario || !telefono_usuario || !id_tipo_usuario) {
            return res.status(400).json({ message: "Todos los campos son obligatorios" });
        }

        if (await esRolAdministrador(id_tipo_usuario)) {
            return res.status(403).json({ message: "Operación no permitida." });
        }

        if (!FormValidators.esEmailValido(correo_usuario) || 
            !FormValidators.esSoloLetras(nombre) || 
            !FormValidators.esSoloLetras(apellido) || 
            !FormValidators.esTelefonoValido(telefono_usuario)) {
            return res.status(400).json({ message: "Datos de entrada inválidos." });
        }

        const existente = await usuarios.findByEmail(correo_usuario);
        if (existente) {
            return res.status(409).json({ message: "Este correo ya está registrado." });
        }

        const clienteCreado = await usuarios.create({
            nombre: FormValidators.normalizarTexto(nombre),
            apellido: FormValidators.normalizarTexto(apellido),
            correo_usuario,
            telefono_usuario: telefono_usuario.trim(),
            contrasena: '',
            id_tipo_usuario,
            estado: 1 
        });

        const id_usuario = clienteCreado.insertId;

        const rawToken = crypto.randomBytes(32).toString('hex');
        const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
        const expiracion = new Date(Date.now() + CLIENTE_TOKEN_VIGENCIA_MS);

        await usuarios.createToken({
            id_usuario,
            token: tokenHash,
            tipo_token: 'REGISTRO',
            fecha_expiracion: expiracion
        });

        const urlCliente = `${process.env.FRONTEND_URL}/establecer-contrasena?token=${rawToken}`;
        await enviarTokenCliente(correo_usuario, urlCliente);

        res.status(201).json({
            message: "Cliente creado correctamente, pendiente de activación. Enlace enviado al correo.",
        });

    } catch (error) {
        console.error("ERROR CREAR CLIENTE:", error);
        res.status(500).json({ message: "Error al crear cliente" });
    }
};

// Invitación de Técnico con ESTADO PENDIENTE (1) -- se activa con el código de 6 dígitos
export const invitarTecnico = async (req, res) => {
    const { correo_usuario, id_tipo_usuario } = req.body;

    if (!correo_usuario || !id_tipo_usuario) {
        return res.status(400).json({ message: "Campos obligatorios faltantes." });
    }

    if (await esRolAdministrador(id_tipo_usuario)) {
        return res.status(403).json({ message: "Operación no permitida." });
    }

    if (!FormValidators.esEmailValido(correo_usuario)) {
        return res.status(400).json({ message: "Correo inválido." });
    }

    try {
        const existente = await usuarios.findByEmail(correo_usuario);
        if (existente) {
            return res.status(409).json({ message: "Este correo ya está registrado." });
        }

        const codigo = generarCodigo6Digitos();
        const salt = await bcrypt.genSalt(12);
        const codigoHash = await bcrypt.hash(codigo, salt);
        const expiracion = new Date(Date.now() + TECNICO_TOKEN_VIGENCIA_MS);

        const tecnicoCreado = await usuarios.create({
            nombre: '',
            apellido: '',
            correo_usuario,
            telefono_usuario: '',
            contrasena: '',
            id_tipo_usuario,
            estado: 1 
        });

        await usuarios.createToken({
            id_usuario: tecnicoCreado.insertId,
            token: codigoHash,
            tipo_token: 'REGISTRO',
            fecha_expiracion: expiracion
        });

        await enviarTokenTecnico(correo_usuario, codigo);

        return res.status(201).json({
            message: "Código de activación enviado. Técnico pendiente de activación."
        });

    } catch (error) {
        console.error("Error invitar técnico:", error);
        return res.status(500).json({ message: "Error procesando invitación." });
    }
};

export const actualizarUsuario = async (req, res) => {
    try {
        let datosAActualizar = { ...req.body };

        if (datosAActualizar.id_tipo_usuario && await esRolAdministrador(datosAActualizar.id_tipo_usuario)) {
            return res.status(403).json({ message: "Operación no permitida." });
        }

        if (datosAActualizar.nombre) {
            if (!FormValidators.esSoloLetras(datosAActualizar.nombre)) return res.status(400).json({ message: "Nombre inválido." });
            datosAActualizar.nombre = FormValidators.normalizarTexto(datosAActualizar.nombre);
        }

        if (datosAActualizar.apellido) {
            if (!FormValidators.esSoloLetras(datosAActualizar.apellido)) return res.status(400).json({ message: "Apellido inválido." });
            datosAActualizar.apellido = FormValidators.normalizarTexto(datosAActualizar.apellido);
        }

        if (datosAActualizar.telefono_usuario) {
            if (!FormValidators.esTelefonoValido(datosAActualizar.telefono_usuario)) return res.status(400).json({ message: "Teléfono inválido." });
            datosAActualizar.telefono_usuario = datosAActualizar.telefono_usuario.trim();
        }

        if (req.body.contrasena) {
            const salt = await bcrypt.genSalt(12);
            datosAActualizar.contrasena = await bcrypt.hash(req.body.contrasena, salt);
        } else {
            delete datosAActualizar.contrasena;
        }

        if (req.body.estado !== undefined) {
            datosAActualizar.estado = req.body.estado;
        }

        const actualizado = await usuarios.update(req.params.id, datosAActualizar);
        if (!actualizado) return res.status(404).json({ message: "Usuario no encontrado" });

        res.json({ message: "Usuario actualizado correctamente" });

    } catch (error) {
        console.error("ERROR ACTUALIZAR:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const eliminarUsuario = async (req, res) => {
    try {
        const eliminado = await usuarios.remove(req.params.id);
        if (!eliminado) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario desactivado (Estado: 0)" });
    } catch (error) {
        console.error("ERROR DESACTIVAR:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

export const restaurarUsuario = async (req, res) => {
    try {
        const restaurado = await usuarios.restaurar(req.params.id);
        if (!restaurado) return res.status(404).json({ message: "Usuario no encontrado" });
        res.json({ message: "Usuario activado (Estado: 2)" });
    } catch (error) {
        console.error("ERROR ACTIVAR:", error);
        res.status(500).json({ message: "Error interno del servidor" });
    }
};

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
            WHERE c.categoria_usuario = 'Técnico' AND u.estado = 2
            GROUP BY u.id_usuario, u.nombre, u.apellido
        `;
        const [rows] = await pool.query(query);
        res.json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};


export const reenviarToken = async (req, res) => {
    const { id } = req.params;

    try {
        const user = await usuarios.findById(id);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado." });
        }

        const [categorias] = await pool.query(
            'SELECT categoria_usuario FROM clasificacion_de_usuarios WHERE id_tipo_usuario = ?',
            [user.id_tipo_usuario]
        );

        if (categorias.length === 0) {
            return res.status(400).json({ message: "El usuario no tiene una categoría válida." });
        }

        const categoriaNombre = categorias[0].categoria_usuario.toLowerCase();
        const esTecnico = categoriaNombre.includes('tecnico') || categoriaNombre.includes('técnico');

        if (esTecnico) {
            const codigo = generarCodigo6Digitos();
            const salt = await bcrypt.genSalt(12);
            const codigoHash = await bcrypt.hash(codigo, salt);
            const expiracion = new Date(Date.now() + TECNICO_TOKEN_VIGENCIA_MS);

            await usuarios.createToken({
                id_usuario: id,
                token: codigoHash,
                tipo_token: 'REGISTRO',
                fecha_expiracion: expiracion
            });

            await enviarTokenTecnico(user.correo_usuario, codigo);

            return res.json({ message: "Nuevo código de activación enviado al técnico." });

        } else {
            const rawToken = crypto.randomBytes(32).toString('hex');
            const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');
            const expiracion = new Date(Date.now() + CLIENTE_TOKEN_VIGENCIA_MS);

            await usuarios.createToken({
                id_usuario: id,
                token: tokenHash,
                tipo_token: 'REGISTRO',
                fecha_expiracion: expiracion
            });

            const urlCliente = `${process.env.FRONTEND_URL}/establecer-contrasena?token=${rawToken}`;
            await enviarTokenCliente(user.correo_usuario, urlCliente);

            return res.json({ message: "Nuevo enlace de activación enviado al cliente." });
        }

    } catch (error) {
        console.error("ERROR REENVIAR TOKEN:", error);
        return res.status(500).json({ message: "Error interno al reenviar el token." });
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
    listarTecnicosDisponibilidad,
    reenviarToken
};