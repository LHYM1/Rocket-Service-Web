import CryptoJS from 'crypto-js';

const SECRET_KEY = process.env.REACT_APP_CRYPTO_KEY;

export const encriptar = (valor) => {
    return CryptoJS.AES.encrypt(valor, SECRET_KEY).toString();
};

export const desencriptar = (valorEncriptado) => {
    try {
        const bytes = CryptoJS.AES.decrypt(valorEncriptado, SECRET_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (e) {
        return null;
    }
};