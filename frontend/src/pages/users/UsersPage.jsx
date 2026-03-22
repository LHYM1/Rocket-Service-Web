import { useState } from 'react';
import { useEffect } from "react";
import axios from 'axios';

import UserForm from '../../components/users/UserForm';
import UsersTable from '../../components/users/UsersTable';

function UsersPage() {
  const [users, setUsers ] = useState([]);
  const [idSeleccionado, setIdSeleccionado] = useState(null);
  
  // constante listar usuarios
  const getUsuarios = () => {
    axios.get("http://localhost:4000/api/usuarios/listar")
    .then((response) => {
      setUsers(response.data);
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
      <UserForm 
        idSeleccionado={idSeleccionado}
        setIdSeleccionado={setIdSeleccionado}
        getUsuarios={getUsuarios}
      />

      <UsersTable 
        user={users}  // User viene del Component UsersTable
        setIdSeleccionado={setIdSeleccionado}
        getUsuarios={getUsuarios}
      />

    </>
  ); 
}

export default UsersPage;