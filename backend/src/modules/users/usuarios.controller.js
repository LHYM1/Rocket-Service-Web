import usuarios from './usuarios.model.js';
import bcrypt from 'bcrypt';

// Listar
export const listarUsuario = async (req, res) => {
    try {
        const users = await usuarios.findAll();
        res.json(users);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Error al listar usuarios' });
    }
};

// Obtener por id 
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

// Crear nuevo usuario
export const crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, correo_usuario, telefono_usuario, contrasena, id_tipo_usuario } = req.body;

        // Validación
        if (!nombre || !apellido || !correo_usuario || !telefono_usuario || !contrasena || !id_tipo_usuario) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }

        // Encriptar contraseña
        const salt = await bcrypt.genSalt(10);
        const contrasenaEncriptada = await bcrypt.hash(contrasena, salt);

        const nuevoUsuario = {
            nombre,
            apellido,
            correo_usuario,
            telefono_usuario,
            contrasena: contrasenaEncriptada,
            id_tipo_usuario
        };

        await usuarios.create(nuevoUsuario);

        res.status(201).json({ 
            message: "Usuario creado correctamente"
        });

    } catch (error) {
        console.error("ERROR CREAR:", error);
        res.status(500).json({ error: error.message });
    }
};

// Actualizar 
export const actualizarUsuario = async (req, res) => {
    try {
        let datosAActualizar = { ...req.body };

        // Si viene contraseña → encriptar
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

// Desactivar (Soft delete)
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

// Activar usuario inactivo
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

// Listar usuarios sin moto 

export const listarUsuariosSinMoto = async (req, res) => {
    try {
        const users = await usuarios.findUsuariosSinMoto();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar usuarios sin moto' });
    }
};

export const listarTecnicosSinOrden = async (req, res) => {
    try {
        const tecnicos = await usuarios.findTecnicosSinOrden();
        res.json(tecnicos);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar técnicos sin orden' });
    }
};

export const listarClientesConMoto = async (req, res) => {
    try {
        const clientes = await usuarios.findClientesConMoto();
        res.json(clientes);
    } catch (error) {
        res.status(500).json({ error: 'Error al listar clientes con moto' });
    }
};

export default {
    listarUsuario,
    obtenerUsuario,
    crearUsuario,
    actualizarUsuario,
    eliminarUsuario,
    restaurarUsuario,
    listarUsuariosSinMoto,
    listarTecnicosSinOrden,  
    listarClientesConMoto 
};