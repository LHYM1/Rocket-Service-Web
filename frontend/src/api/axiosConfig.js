import axios from 'axios';
import { desencriptar } from '../utils/crypto';


export const api = axios.create({
    baseURL: "http://localhost:4000/api", 
    headers: {
        "Content-Type": "application/json",
    },
    withCredentials: true, // Habilita el envío de cookies o credenciales
})


// Interceptor para inyectar automáticamente el Token JWT en cada petición
api.interceptors.request.use(
    (config) => {
        const tokenEncriptado = localStorage.getItem('token');
        console.log("Token encriptado:", tokenEncriptado);

        if (tokenEncriptado) {
            try {
                const token = desencriptar(tokenEncriptado);
                console.log("Token desencriptado:", token);

                if (token) {
                    config.headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.error("Error al desencriptar token:", error);
            }   
            
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default api;