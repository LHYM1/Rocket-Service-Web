// cypress/e2e/03-usuarios.cy.js
import { USUARIOS, TIPOS_USUARIO } from '../support/datos';

describe('RF-003.1 / 003.4 / 003.5 / 003.6 - Gestión de usuarios (escrituras y correos Resend simulados)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/usuarios/listar', { body: USUARIOS }).as('listar');
    cy.intercept('GET', '**/api/clasificacion_de_usuarios/listar', { body: TIPOS_USUARIO });
    cy.intercept('GET', '**/api/usuarios/verificar-correo**', { body: { valido: true } }).as('verificar');
    cy.entrar('Administrador', '/panel/users');
    cy.wait('@listar');
  });

  const nuevo = () => {
    cy.contains('button', 'Agregar Usuario').click();
    cy.get('.rs-modal').should('be.visible');
  };

  // ---------- RF-003.4 Consultar ----------
  it('CP-RF003.4-01: Listado completo sin filtro', () => {
    cy.get('table.rs-table tbody tr').should('have.length', USUARIOS.length);
  });

  it('CP-RF003.4-02: Columnas obligatorias del listado', () => {
    ['ID', 'Nombre completo', 'Correo electrónico', 'Teléfono', 'Categoría / Rol', 'Estado', 'Acciones'].forEach((h) =>
      cy.contains('table.rs-table th', h).should('exist')
    );
  });

  it('CP-RF003.4-03: Búsqueda por correo sin resultados', () => {
    cy.get('.rs-search-input').type('no_existe_999@gmail.com');
    cy.contains('No se encontraron usuarios coincidentes.').should('be.visible');
  });

  it('CP-RF003.4-03b: Búsqueda por correo con resultado', () => {
    cy.get('.rs-search-input').type('mario@gmail.com');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'mario@gmail.com');
  });

  it('CP-RF003.4-04: Usuario sin rol Administrador no accede al listado', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.entrar(rol, '/panel/users');
      cy.location('pathname').should('not.eq', '/panel/users');
    });
  });

  it('CP-RF003.4-05: El estado de cada usuario se muestra correctamente', () => {
    cy.contains('tr', 'laura@gmail.com').should('contain', 'Activo');
    cy.contains('tr', 'tec.pendiente@gmail.com').should('contain', 'Pendiente').and('contain', 'Sin completar');
    cy.contains('tr', 'sofia@gmail.com').should('contain', 'Inactivo');
  });

  it('CP-RF003.4-06: Filtro por estado Inactivo', () => {
    cy.get('select.rs-select').eq(1).select('Inactivo');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'sofia@gmail.com');
  });

  // ---------- RF-003.1 Registrar ----------
  it('CP-RF003.1-01: Registro exitoso de un técnico (solo correo) y envío de token por correo', () => {
    cy.intercept('POST', '**/api/usuarios/invitar-tecnico', { statusCode: 201, body: { message: 'Invitación enviada' } }).as('invitar');
    nuevo();
    cy.elegirTipo('Técnico');
    cy.escribirCorreo('tecnico.nuevo');
    cy.contains('button', 'Enviar invitación').click();
    cy.wait('@invitar').its('request.body').should((b) => {
      expect(b.correo_usuario).to.eq('tecnico.nuevo@gmail.com');
      expect(b.id_tipo_usuario).to.eq(2);
      expect(b).to.not.have.any.keys('nombre', 'apellido', 'telefono_usuario');
    });
    cy.contains('Código de activación enviado exitosamente al correo del técnico.').should('be.visible');
    cy.get('@invitar.all').should('have.length', 1);
  });

  it('CP-RF003.1-02: Registro exitoso de un cliente (datos completos)', () => {
    cy.intercept('POST', '**/api/usuarios/invitar-cliente', { statusCode: 201, body: { message: 'ok' } }).as('invitar');
    nuevo();
    cy.elegirTipo('Cliente');
    cy.get('input[name="nombre"]').type('Carlos');
    cy.get('input[name="apellido"]').type('Mejía');
    cy.escribirCorreo('carlos.cliente');
    cy.get('input[name="telefono_usuario"]').type('3105556677');
    cy.contains('button', 'Registrar y enviar acceso').click();
    cy.wait('@invitar').its('request.body').should((b) => {
      expect(b.nombre).to.eq('Carlos');
      expect(b.apellido).to.eq('Mejía');
      expect(b.correo_usuario).to.eq('carlos.cliente@gmail.com');
      expect(b.telefono_usuario).to.eq('3105556677');
      expect(b.id_tipo_usuario).to.eq(1);
    });
    cy.contains('Cliente registrado en estado Pendiente. Enlace de contraseña enviado.').should('be.visible');
  });

  it('CP-RF003.1-03: Rechazo por correo duplicado', () => {
    cy.intercept('GET', '**/api/usuarios/verificar-correo**', { body: { valido: false, motivo: 'duplicado' } });
    cy.intercept('POST', '**/api/usuarios/invitar-tecnico').as('invitar');
    nuevo();
    cy.elegirTipo('Técnico');
    cy.escribirCorreo('laura');
    cy.contains('Este correo ya está registrado.').should('be.visible');
    cy.contains('button', 'Enviar invitación').click();
    cy.get('@invitar.all').should('have.length', 0);
  });

  it('CP-RF003.1-04: Rechazo por campos obligatorios vacíos', () => {
    cy.intercept('POST', '**/api/usuarios/invitar-cliente').as('invitar');
    nuevo();
    cy.elegirTipo('Cliente');
    cy.contains('button', 'Registrar y enviar acceso').click();
    ['El correo electrónico es obligatorio.', 'El nombre es obligatorio.', 'El apellido es obligatorio.', 'El teléfono es obligatorio.'].forEach((m) =>
      cy.contains(m).should('be.visible')
    );
    cy.get('@invitar.all').should('have.length', 0);
  });

  it('CP-RF003.1-04b: Técnico sin correo y botón deshabilitado sin tipo', () => {
    nuevo();
    cy.contains('button', 'Guardar').should('be.disabled');
    cy.elegirTipo('Técnico');
    cy.contains('button', 'Enviar invitación').click();
    cy.contains('El correo electrónico es obligatorio.').should('be.visible');
  });

  it('CP-RF003.1-05: Solo el Administrador ve el botón de registrar usuarios', () => {
    cy.contains('button', 'Agregar Usuario').should('be.visible');
    cy.entrar('Técnico', '/panel/users');
    cy.location('pathname').should('not.eq', '/panel/users');
  });

  it('CP-RF003.1-06: Falla en el envío del correo informa al Administrador', () => {
    cy.intercept('POST', '**/api/usuarios/invitar-tecnico', {
      statusCode: 500,
      body: { message: 'El token no se ha podido enviar. Inténtelo de nuevo' },
    });
    nuevo();
    cy.elegirTipo('Técnico');
    cy.escribirCorreo('fallo.envio');
    cy.contains('button', 'Enviar invitación').click();
    cy.contains('El token no se ha podido enviar. Inténtelo de nuevo').should('be.visible');
  });

  it('CP-RF003.1-07: Usuario queda en estado Pendiente y permite reenviar el token', () => {
    cy.intercept('POST', '**/api/usuarios/reenviar-token/12', { statusCode: 200, body: { message: 'ok' } }).as('reenviar');
    cy.contains('tr', 'tec.pendiente@gmail.com').should('contain', 'Pendiente').find('button[title^="Reenviar"]').click();
    cy.wait('@reenviar');
    cy.contains('Código de activación reenviado con éxito a tec.pendiente@gmail.com').should('be.visible');
    cy.contains('tr', 'tec.pendiente@gmail.com').find('.rs-btn-edit').should('not.exist');
  });

  it('CP-RF003.1-08: Nombre sin números, teléfono solo dígitos y máximo 10', () => {
    nuevo();
    cy.elegirTipo('Cliente');
    cy.get('input[name="nombre"]').type('Juan123').invoke('val').should('not.match', /\d/);
    cy.get('input[name="telefono_usuario"]').type('abc3001234567890').invoke('val').should('match', /^\d{10}$/);
  });

  // ---------- RF-003.5 Actualizar ----------
  it('CP-RF003.5-01: Actualización exitosa de un usuario existente', () => {
    cy.intercept('PUT', '**/api/usuarios/modificar/11', { statusCode: 200, body: { message: 'ok' } }).as('modificar');
    cy.contains('tr', 'laura@gmail.com').find('.rs-btn-edit').click();
    cy.get('input[name="nombre"]').should('have.value', 'Laura');
    cy.get('input[name="telefono_usuario"]').clear().type('3109998877');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.wait('@modificar').its('request.body').should((b) => {
      expect(b.telefono_usuario).to.eq('3109998877');
      expect(b.nombre).to.eq('Laura');
    });
    cy.contains('Usuario actualizado correctamente.').should('be.visible');
  });

  it('CP-RF003.5-02: Rechazo al actualizar un usuario inexistente', () => {
    cy.intercept('PUT', '**/api/usuarios/modificar/11', { statusCode: 404, body: { message: 'Usuario no encontrado' } });
    cy.contains('tr', 'laura@gmail.com').find('.rs-btn-edit').click();
    cy.get('input[name="telefono_usuario"]').clear().type('3101112233');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('Usuario no encontrado').should('be.visible');
  });

  it('CP-RF003.5-03: Rechazo por campos obligatorios vacíos', () => {
    cy.intercept('PUT', '**/api/usuarios/modificar/**').as('modificar');
    cy.contains('tr', 'laura@gmail.com').find('.rs-btn-edit').click();
    cy.get('input[name="nombre"]').clear();
    cy.get('input[name="apellido"]').clear();
    cy.get('input[name="telefono_usuario"]').clear();
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('El nombre es obligatorio.').should('be.visible');
    cy.contains('El apellido es obligatorio.').should('be.visible');
    cy.contains('El teléfono es obligatorio.').should('be.visible');
    cy.get('@modificar.all').should('have.length', 0);
  });

  it('CP-RF003.5-03b: Teléfono menor a 10 dígitos es rechazado', () => {
    cy.contains('tr', 'laura@gmail.com').find('.rs-btn-edit').click();
    cy.get('input[name="telefono_usuario"]').clear().type('300123');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('El teléfono debe tener exactamente 10 dígitos.').should('be.visible');
  });

  it('CP-RF003.5-04: Un usuario sin rol Administrador no actualiza usuarios', () => {
    cy.entrar('Técnico', '/panel/users');
    cy.location('pathname').should('not.eq', '/panel/users');
    cy.get('.rs-btn-edit').should('not.exist');
  });

  // ---------- RF-003.6 Desactivar ----------
  it('CP-RF003.6-01: Desactivación exitosa de un usuario existente', () => {
    cy.intercept('PUT', '**/api/usuarios/eliminar/11', { statusCode: 200, body: { message: 'ok' } }).as('desactivar');
    cy.contains('tr', 'laura@gmail.com').find('.rs-btn-delete').click();
    cy.wait('@desactivar');
    cy.contains('Usuario desactivado correctamente.').should('be.visible');
  });

  it('CP-RF003.6-02: Rechazo al desactivar un usuario inexistente', () => {
    cy.intercept('PUT', '**/api/usuarios/eliminar/11', { statusCode: 404, body: { message: 'Usuario no encontrado' } });
    cy.contains('tr', 'laura@gmail.com').find('.rs-btn-delete').click();
    cy.contains('Usuario no encontrado').should('be.visible');
  });

  it('CP-RF003.6-04: Usuario ya inactivo no ofrece desactivar, solo reactivar', () => {
    cy.contains('tr', 'sofia@gmail.com').within(() => {
      cy.get('.rs-btn-delete').should('not.exist');
      cy.get('.rs-btn-reactivate').should('exist');
    });
  });

  it('CP-RF003.6-05: Un usuario sin rol Administrador no desactiva usuarios', () => {
    cy.entrar('Cliente', '/panel/users');
    cy.location('pathname').should('not.eq', '/panel/users');
    cy.get('.rs-btn-delete').should('not.exist');
  });

  it('CP-RF003.6-08: Reactivación de usuario inactivo', () => {
    cy.intercept('PUT', '**/api/usuarios/restaurar/14', { statusCode: 200, body: { message: 'ok' } }).as('restaurar');
    cy.contains('tr', 'sofia@gmail.com').find('.rs-btn-reactivate').click();
    cy.wait('@restaurar');
    cy.contains('Usuario reactivado correctamente.').should('be.visible');
  });
});

describe('RF-003 - API de verificación de correo (solo lectura)', () => {
  it('CP-RF003.1-03: correo existente se reporta como duplicado', () => {
    cy.credenciales().then(({ correo }) =>
      cy.peticion('GET', `/api/auth/verificar-correo?correo_usuario=${correo}`).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body).to.deep.include({ valido: false, motivo: 'duplicado' });
      })
    );
  });

  it('Correo nuevo está disponible', () => {
    cy.peticion('GET', '/api/auth/verificar-correo?correo_usuario=disponible_qa_98765@gmail.com').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.valido).to.eq(true);
    });
  });
  it('Formato inválido y correo faltante', () => {
    cy.peticion('GET', '/api/auth/verificar-correo?correo_usuario=usuario@').then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Formato de correo inválido');
    });
    cy.peticion('GET', '/api/auth/verificar-correo').then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Correo no proporcionado');
    });
  });
});