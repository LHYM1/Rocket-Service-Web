import { useEffect, useState } from "react";
import axios from "axios";

function UserForm({ usuarioSeleccionado, setUsuarioSeleccionado, getUsuarios }) {

  const [form, setForm] = useState({
    codigo_usuario: "",
    nombre: "",
    apellido: "",
    correo_usuario: "",
    telefono_usuario: ""
  });

  useEffect(() => {
    if (usuarioSeleccionado) {
      setForm(usuarioSeleccionado);
    }
  }, [usuarioSeleccionado]);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };
}

export default UserForm;