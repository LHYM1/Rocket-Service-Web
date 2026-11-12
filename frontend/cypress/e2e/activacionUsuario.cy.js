// cypress/e2e/04-activacion.cy.js
describe('RF-003.2 - Completar registro del técnico (Resend y BD simulados)', () => {
  const CORREO = 'tecnico.qa@gmail.com';
  const RUTA = `/register?correo=${encodeURIComponent(CORREO)}`;
  const validar = (body, statusCode = 200) =>
    cy.intercept('GET', '**/api/auth/validar-codigo-tecnico**', { statusCode, body }).as('validar');
  const vigente = () => validar({ valido: true, correo_usuario: CORREO, minutosRestantes: 25 });
  const llenar = (conf = 'Abcd1234!') => {
    cy.get('input[name="nombre"]').type('Mario');
    cy.get('input[name="apellido"]').type('Pérez');
    cy.get('input[name="telefono_usuario"]').type('3001234567');
    cy.get('input[name="contrasena"]').type('Abcd1234!');
    cy.get('input[name="confirmarContrasena"]').type(conf);
    cy.escribirToken('123456');
  };

  it('CP-RF003.2-01: Activación exitosa con token correcto y vigente', () => {
    vigente();
    cy.intercept('POST', '**/api/auth/register', { statusCode: 200, body: { message: 'Técnico activado correctamente.' } }).as('registrar');
    cy.visit(RUTA);
    cy.wait('@validar');
    cy.contains('Registro de Técnico').should('be.visible');
    llenar();
    cy.contains('button', 'Completar Registro').click();
    cy.wait('@registrar').its('request.body').should((b) => {
      expect(b.tokenRegistro).to.eq('123456');
      expect(b.correo_usuario).to.eq(CORREO);
      expect(b.nombre).to.eq('Mario');
      expect(b.telefono_usuario).to.eq('3001234567');
    });
    cy.contains('¡Te registraste con éxito!').should('be.visible');
    cy.contains('button', 'Ir a Iniciar Sesión').click();
    cy.location('pathname').should('eq', '/');
  });

  it('CP-RF003.2-02: Rechazo cuando el correo no coincide con el registrado', () => {
    vigente();
    const msg = 'No existe una invitación pendiente para este correo o el usuario ya fue activado.';
    cy.intercept('POST', '**/api/auth/register', { statusCode: 400, body: { message: msg } });
    cy.visit(RUTA);
    cy.contains('Registro de Técnico').should('be.visible');
    llenar();
    cy.get('input[name="correo_usuario"]').clear().type('otro.correo@gmail.com');
    cy.contains('button', 'Completar Registro').click();
    cy.contains('Enlace de registro no válido').should('be.visible');
    cy.contains(msg).should('be.visible');
  });

  it('CP-RF003.2-03: Rechazo por token incorrecto', () => {
    vigente();
    const msg = 'El código de activación es incorrecto. Te quedan 4 intento(s).';
    cy.intercept('POST', '**/api/auth/register', { statusCode: 400, body: { message: msg } });
    cy.visit(RUTA);
    cy.contains('Registro de Técnico').should('be.visible');
    llenar();
    cy.contains('button', 'Completar Registro').click();
    cy.contains(msg).should('be.visible');
  });

  it('CP-RF003.2-04: Rechazo por token expirado', () => {
    const msg = 'El tiempo de activación (30 minutos) ha expirado.';
    validar({ valido: false, message: msg }, 401);
    cy.visit(RUTA);
    cy.contains('Enlace de registro no válido').should('be.visible');
    cy.contains(msg).should('be.visible');
    cy.contains('Solicita al administrador un nuevo enlace de activación.').should('be.visible');
  });

  it('CP-RF003.2-05: Invalidación del token tras 5 intentos fallidos', () => {
    const msg = 'Has superado el límite de 5 intentos fallidos. La invitación ha sido invalidada.';
    vigente();
    cy.intercept('POST', '**/api/auth/register', { statusCode: 401, body: { message: msg } });
    cy.visit(RUTA);
    cy.contains('Registro de Técnico').should('be.visible');
    llenar();
    cy.contains('button', 'Completar Registro').click();
    cy.contains(msg).should('be.visible');
  });

  it('CP-RF003.2-06: Rechazo por contraseñas no coincidentes', () => {
    vigente();
    cy.intercept('POST', '**/api/auth/register').as('registrar');
    cy.visit(RUTA);
    cy.contains('Registro de Técnico').should('be.visible');
    llenar('Distinta123!');
    cy.contains('Las contraseñas no coinciden').should('be.visible');
    cy.contains('button', 'Completar Registro').click();
    cy.get('@registrar.all').should('have.length', 0);
  });

  it('CP-RF003.2-07: El registro se envía una sola vez (UPDATE, sin duplicar)', () => {
    vigente();
    cy.intercept('POST', '**/api/auth/register', { statusCode: 200, body: { message: 'Técnico activado correctamente.' } }).as('registrar');
    cy.visit(RUTA);
    cy.contains('Registro de Técnico').should('be.visible');
    llenar();
    cy.contains('button', 'Completar Registro').click();
    cy.contains('¡Te registraste con éxito!').should('be.visible');
    cy.get('@registrar.all').should('have.length', 1);
  });

  it('CP-RF003.2-08: Token ya utilizado deja el enlace sin validez', () => {
    validar({ valido: false, message: 'El enlace ya ha sido utilizado o la invitación no existe.' }, 404);
    cy.visit(RUTA);
    cy.contains('Enlace de registro no válido').should('be.visible');
    cy.contains('El enlace ya ha sido utilizado o la invitación no existe.').should('be.visible');
  });

  it('CP-RF003.2-09: Validaciones del formulario (nombre, teléfono, contraseña y campos vacíos)', () => {
    vigente();
    cy.visit(RUTA);
    cy.contains('Registro de Técnico').should('be.visible');
    cy.get('input[name="nombre"]').type('Mario99').invoke('val').should('not.match', /\d/);
    cy.get('input[name="telefono_usuario"]').type('30abc0123456789').invoke('val').should('match', /^\d{10}$/);
    cy.get('input[name="contrasena"]').type('abc');
    cy.contains('✗ Mín. 8 caracteres').should('be.visible');
    cy.contains('✗ Una Mayúscula').should('be.visible');
    cy.get('input[name="contrasena"]').clear().type('Abcd1234!');
    cy.contains('✓ Mín. 8 caracteres').should('be.visible');
    cy.contains('✓ Carácter especial').should('be.visible');
    cy.get('input[name="nombre"]').clear();
    cy.contains('button', 'Completar Registro').click();
    cy.contains('Completa todos los campos correctamente.').should('be.visible');
    cy.contains('Código numérico de 6 dígitos requerido').should('be.visible');
  });
});

describe('RF-003.2 / RF-003.3 - API de activación (rechazos reales, sin escrituras)', () => {
  const REG = '/api/auth/register';

  it('Registro sin datos obligatorios (400)', () => {
    cy.peticion('POST', REG, null, { correo_usuario: 'x@gmail.com' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El correo, contraseña y código de activación son obligatorios.');
    });
  });

  it('Datos de perfil con formato inválido (400)', () => {
    cy.peticion('POST', REG, null, {
      tokenRegistro: '123456', correo_usuario: 'x@gmail.com', contrasena: 'Abcd1234!', nombre: '123', apellido: 'Pérez', telefono_usuario: '3001234567',
    }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Los datos de perfil ingresados no tienen un formato válido.');
    });
  });

  it('CP-RF003.2-02: Correo sin invitación pendiente (400)', () => {
    cy.peticion('POST', REG, null, {
      tokenRegistro: '123456', correo_usuario: 'sin_invitacion_qa_12345@gmail.com', contrasena: 'Abcd1234!', nombre: 'Mario', apellido: 'Pérez', telefono_usuario: '3001234567',
    }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('No existe una invitación pendiente para este correo o el usuario ya fue activado.');
    });
  });

  it('Validar código técnico: sin correo (400) y sin invitación (404)', () => {
    cy.peticion('GET', '/api/auth/validar-codigo-tecnico').then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body).to.deep.include({ valido: false, message: 'Correo no proporcionado.' });
    });
    cy.peticion('GET', '/api/auth/validar-codigo-tecnico?correo_usuario=sin_invitacion_qa_12345@gmail.com').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.valido).to.eq(false);
    });
  });

  it('CP-RF003.3-03: Token de cliente inexistente o ya utilizado (404)', () => {
    cy.peticion('GET', '/api/auth/validar-token-cliente/tokeninexistenteqa123456').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body).to.deep.include({ valido: false, message: 'El enlace no es válido o ya fue utilizado.' });
    });
  });

  it('CP-RF003.3: Establecer contraseña exige token, contraseña y datos de la moto', () => {
    const URL = '/api/auth/establecer-contrasena-cliente';
    cy.peticion('POST', URL, null, {}).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El token y la contraseña son obligatorios.');
    });
    cy.peticion('POST', URL, null, { token: 'abc', contrasena: 'Abcd1234!' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Los datos de tu motocicleta son obligatorios.');
    });
    cy.peticion('POST', URL, null, { token: 'abc', contrasena: 'Abcd1234!', placa: 'AB', id_modelo: 1, kilometraje_actual: 100 }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('La placa debe tener exactamente 6 caracteres (solo letras y números).');
    });
    cy.peticion('POST', URL, null, { token: 'abc', contrasena: 'Abcd1234!', placa: 'ABC12D', id_modelo: 1, kilometraje_actual: -5 }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El kilometraje debe ser un número entero entre 0 y 500000.');
    });
  });

  it('CP-RF003.3-02: Token de cliente inválido no permite activar la cuenta', () => {
    cy.peticion('POST', '/api/auth/establecer-contrasena-cliente', null, {
      token: 'tokeninexistenteqa123456', contrasena: 'Abcd1234!', placa: 'ABC12D', id_modelo: 1, kilometraje_actual: 1000,
    }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El enlace no es válido o ya fue utilizado.');
    });
  });
});