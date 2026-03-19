// en la constante usuario se guarda los datos de endPoint agregar, eliminar, actualizar y listar de la tabla usuario
const usuarios = require('../models/usuariosModelo');

exports.listarUsuario = async (req, res) => {

    try {
        const users = await usuarios.findAll();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.obtenerUsuario = async (req, res) => {
    try {
        const users = await usuarios.findById(req.params.id);
        if (!users) return res.status(404).json({ message: "usuario no encontrado" });
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.crearUsuario = async (req, res) => {
    try {
        const { nombre, apellido, correo_usuario, telefono_usuario, contrasena, foto_usuario_url, id_tipo_usuario } = req.body; // Campos que se envian desde el frontend

        if (!nombre || !apellido || !correo_usuario, !telefono_usuario || !contrasena || !foto_usuario_url || !id_tipo_usuario) {
            return res.status(400).json({ 
                message: "Todos los campos son obligatorios" 
            });
        }
        
        const id = await usuarios.create(req.body);

        res.status(201).json({ 
            message: "Usuario creado correctamente",
        }); 
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.actualizarUsuario = async (req, res) => {
    try {
        const actualizado = await usuarios.update(req.params.id, req.body);

        if (!actualizado) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        res.json({ message: "Usuario actualizado correctamente" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.eliminarUsuario = async (req, res) => {
    try {
        const eliminado = await usuarios.delete(req.params.id);
        if (!eliminado) 
            return res.status(404).json({
                message: "Usuario no encontrado" 
            });
        res.json({ message: "Usuario eliminado" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

