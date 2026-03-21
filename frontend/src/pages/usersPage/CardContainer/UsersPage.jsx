import { useState } from 'react'
import { useEffect } from "react";
import axios from 'axios'

function UsersPage() {
  const [usuarios, setUsuarios ] = useState([]);
  const [showModal, setShowModal] = useState(false); // Estado para abrir/cerrar el modal
  const [eliminar, setEliminar] = useState(false);
  
  const getUsuarios = () => {
    axios.get("http://localhost:4000/api/usuarios/listar")
    .then((response) => {
      setUsuarios(response.data);
    })
    .catch((error) => {
      console.log(error);
    });
  }

  useEffect(() => { // function useEffect para imprimir datos
    getUsuarios();
  }, []);

  return (
    <>
      <UserForm />
      <UsersTable usuarios={usuarios} />
    </>
  );
  
}

export default UsersPage();