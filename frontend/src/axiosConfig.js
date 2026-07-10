import axios from 'axios';
import { desencriptar } from './utils/crypto';

axios.interceptors.request.use(
    (config) => {
        const tokenEncriptado = localStorage.getItem('token');
        console.log("Token encriptado:", tokenEncriptado);
        if (tokenEncriptado) {
            const token = desencriptar(tokenEncriptado);
            console.log("Token desencriptado:", token);
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;