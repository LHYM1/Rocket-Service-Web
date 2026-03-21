import useState from 'react';
import useEffect from 'react';


const [selectUser, setSelectUser] = useState(null); // usuario seleccionado

const handleEdit = (usuario) => {
    setSelectUser(usuario);
}