const jwt = require("jsonwebtoken");
const pool = require("../../config/db"); // conexion a mysql

const login = async (req, res) => {
  const { usuario, contrasena } = req.body;

  try {
    const [rows] = await pool.query("SELECT * FROM usuarios WHERE id_usuario = ?", [usuario]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    const user = rows[0];

    // Bcrypt para comparar contraseñas
    if (contrasena !== user.contrasena) {
      return res.status(401).json({ message: "Contraseña incorrecta" });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1min" }
    );

    res.json({ token });

    } catch (error) {
        res.status(500).json({ message: "Servidor caído o base de datos caída", error });
    }
};

module.exports = { login };