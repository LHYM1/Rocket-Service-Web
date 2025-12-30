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

    // simulación envio de datos
    console.log("Dattos del formulario:", form);


}
export default login;