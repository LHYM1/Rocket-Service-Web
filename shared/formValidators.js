// utils/formValidators.js

export class FormValidators {
  // 1. Constantes/Expresiones Regulares (Encapsuladas en la clase)
  static PATTERNS = {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    SOLO_LETRAS: /^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/, // Incluye espacio para nombres compuestos
    TELEFONO: /^\d{10}$/
  };

  // 2. Métodos de Formato / Normalización
  static normalizarTexto(texto) {
    if (!texto) return '';
    const limpio = texto.trim();
    return limpio.charAt(0).toUpperCase() + limpio.slice(1).toLowerCase();
  }

  static normalizarNombreCompleto(texto) {
    if (!texto) return '';
    return texto
      .trim()
      .split(/\s+/)
      .map((palabra) => this.normalizarTexto(palabra))
      .join(' ');
  }

  // 3. Validadores Individuales (Retornan boolean)
  static esEmailValido(email) {
    return this.PATTERNS.EMAIL.test(email?.trim());
  }

  static esSoloLetras(texto) {
    return this.PATTERNS.SOLO_LETRAS.test(texto?.trim());
  }

  static esTelefonoValido(telefono) {
    return this.PATTERNS.TELEFONO.test(telefono?.trim());
  }

  // 4. Validador Compuesto (Retorna mensaje + objeto de errores)
  static validarContacto({ nombre, email, telefono }) {
    const errores = {
      nombre: false,
      email: false,
      telefono: false
    };

    if (!nombre || !this.esSoloLetras(nombre)) {
      errores.nombre = true;
      return { mensaje: 'El nombre contiene caracteres inválidos o está vacío.', camposErrores: errores };
    }

    if (!email || !this.esEmailValido(email)) {
      errores.email = true;
      return { mensaje: 'El correo electrónico no tiene un formato válido.', camposErrores: errores };
    }

    if (!telefono || !this.esTelefonoValido(telefono)) {
      errores.telefono = true;
      return { mensaje: 'El número de teléfono debe contener exactamente 10 dígitos.', camposErrores: errores };
    }

    return null; // Sin errores
  }
  
  // objeto para validar valores ingresados en las credenciales (password)
  static validarContrasenaCliente(passwoord, confirmarPassword) {
    establecerContrasenaCliente: (password, confirmPassword) => {
      if (!password || password.trim().length < 6) {
          return "La contraseña debe tener al menos 6 caracteres.";
      }
      if (password !== confirmPassword) {
          return "Las contraseñas no coinciden.";
      }
      return null; // Todo válido
    }
  }


};