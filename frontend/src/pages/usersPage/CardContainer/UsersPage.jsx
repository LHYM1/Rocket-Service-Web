import { useState } from 'react';
import { useEffect } from "react";
import axios from 'axios';

//import UserForm from '../../components/users/UserForm';
import UsersTable from './UsersTable';

function UsersPage() {
  const [users, setUsers ] = useState([]);
  
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
      {/**
       *<UserForm 
        usuarioSeleccionado={usuarioSeleccionado}
        setUsuarioSeleccionado={setUsuarioSeleccionado}
        getUsuarios={getUsuarios}
       />
      */}
     

      <UsersTable 
        user={users} 
        setUsuarioSeleccionado={setUsers}
        getUsuarios={getUsuarios}
      />

    </>
  ); 
}

export default UsersPage;