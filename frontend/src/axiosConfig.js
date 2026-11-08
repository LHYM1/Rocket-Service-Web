import axios from 'axios';

// La URL base viene de una variable de entorno (REACT_APP_API_URL).
// - En desarrollo local, la defines en frontend/.env como 
// - En Vercel (producción), la defines en su panel como la URL de Render
// Así, todo el código usa rutas relativas ("/api/...") y nunca hay que tocar
// ningún archivo al cambiar de entorno -- solo el valor de esta variable.
axios.defaults.baseURL = process.env.REACT_APP_API_URL || '';

axios.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

export default axios;