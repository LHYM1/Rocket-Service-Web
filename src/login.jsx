import { useState } from "react";

function iniciarsesion() {
    const [form, setForm] = useState({
        usuario: "",
        contraseña: ""
    });
}

const handleChange = (e) => {
    setForm ({
        ...form,
        [e.target.name]: e.target.value
    });
};

const handleSubmit = (e) => {
    e.preventDefault();

    // simulación envío de datos
    console.log("Datos del formulario:", form);

    if (form.usuario === "" || form.contrasena === "") {
      alert("Todos los campos son obligatorios");
      return;
    }
    

}
export default login;