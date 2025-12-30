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
}

export default login;