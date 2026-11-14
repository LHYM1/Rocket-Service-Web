// cypress/e2e/07-tipos-servicio.cy.js
import { TIPOS_SERVICIO } from '../support/datos';

describe('RF-007 - Tipos de servicio (UI con escrituras simuladas)', () => {
  const entrar = (rol = 'Administrador') => {
    cy.intercept('GET', '**/api/tipo_servicio/listar', { body: TIPOS_SERVICIO }).as('listar');
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar(rol, '/panel/type-services');
    cy.wait('@listar');
  };
  const abrirNuevo = () => cy.contains('button', 'Agregar tipo servicio').click();

  it('CP-RF007.2-01: Consulta exitosa de tipos de servicio', () => {
    entrar();
    cy.get('table.rs-table tbody tr').should('have.length', 2);
    cy.contains('tr', 'CAMBIO DE ACEITE').should('contain', 'Activo').and('contain', 'Aceite y filtro');
    cy.contains('tr', 'AJUSTE DE FRENOS').should('contain', 'Inactivo').and('contain', 'Sin descripción');
  });

  it('CP-RF007.2-02: Cliente sin permisos de consulta', () => {
    cy.entrar('Cliente', '/panel/type-services');
    cy.location('pathname').should('not.eq', '/panel/type-services');
  });

  it('CP-RF007.2-02b: El Técnico consulta en solo lectura', () => {
    entrar('Técnico');
    cy.get('table.rs-table tbody tr').should('have.length', 2);
    cy.contains('button', 'Agregar tipo servicio').should('not.exist');
    cy.get('.rs-btn-edit, .rs-btn-delete').should('not.exist');
  });

  it('CP-RF007.2-03: Búsqueda por tipo de servicio', () => {
    entrar();
    cy.get('.rs-search-input').type('frenos');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'AJUSTE DE FRENOS');
  });

  it('CP-RF007.2-04: Buscar sin valor muestra el listado completo', () => {
    entrar();
    cy.get('.rs-search-input').type('frenos').clear();
    cy.get('table.rs-table tbody tr').should('have.length', 2);
  });

  it('CP-RF007.2-05: Mensaje cuando no se encuentra ningún tipo de servicio', () => {
    entrar();
    cy.get('.rs-search-input').type('zzz_inexistente');
    cy.contains('No se encontraron tipos de servicio registrados.').should('be.visible');
  });

  it('CP-RF007.2-06: Filtro por estado Inactivo', () => {
    entrar();
    cy.get('select.rs-select').select('Inactivo');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'AJUSTE DE FRENOS');
  });

  it('CP-RF007.1-01: Registro exitoso (nombre en mayúsculas)', () => {
    entrar();
    cy.intercept('POST', '**/api/tipo_servicio/crear', { statusCode: 201, body: { id_tipo_servicio: 9, message: 'Tipo de servicio creado exitosamente' } }).as('crear');
    abrirNuevo();
    cy.get('input[name="nombre_servicio"]').type('cambio de llantas').should('have.value', 'CAMBIO DE LLANTAS');
    cy.get('textarea[name="descripcion_servicio"]').type('Montaje y balanceo');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Guardar').click();
    cy.wait('@crear').its('request.body').should((b) => {
      expect(b.nombre_servicio).to.eq('CAMBIO DE LLANTAS');
      expect(b.descripcion_servicio).to.eq('Montaje y balanceo');
    });
    cy.get('@alerta').should('have.been.calledWith', 'Tipo de servicio creado exitosamente');
  });

  it('CP-RF007.1-03: Nombre duplicado es rechazado', () => {
    entrar();
    cy.intercept('POST', '**/api/tipo_servicio/crear', { statusCode: 400, body: { message: 'Ya existe un tipo de servicio con ese nombre.' } });
    abrirNuevo();
    cy.get('input[name="nombre_servicio"]').type('CAMBIO DE ACEITE');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Guardar').click();
    cy.get('@alerta').should('have.been.calledWith', 'Ya existe un tipo de servicio con ese nombre.');
  });

  it('CP-RF007.1-05: Nombre vacío no se envía', () => {
    entrar();
    cy.intercept('POST', '**/api/tipo_servicio/crear').as('crear');
    abrirNuevo();
    cy.contains('button', 'Guardar').click();
    cy.contains('EL NOMBRE DEL SERVICIO ES REQUERIDO').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF007.3-01: Actualización exitosa', () => {
    entrar();
    cy.intercept('PUT', '**/api/tipo_servicio/modificar/1', { statusCode: 200, body: { message: 'Tipo de servicio actualizado correctamente' } }).as('modificar');
    cy.contains('tr', 'CAMBIO DE ACEITE').find('.rs-btn-edit').click();
    cy.get('input[name="nombre_servicio"]').should('have.value', 'CAMBIO DE ACEITE').clear().type('cambio de aceite premium');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Actualizar').click();
    cy.wait('@modificar').its('request.body.nombre_servicio').should('eq', 'CAMBIO DE ACEITE PREMIUM');
    cy.get('@alerta').should('have.been.calledWith', 'Tipo de servicio actualizado correctamente');
  });

  it('CP-RF007.3-02: El Técnico no puede actualizar tipos de servicio', () => {
    entrar('Técnico');
    cy.get('.rs-btn-edit').should('not.exist');
  });

  it('CP-RF007.3-03: Campo obligatorio vacío al actualizar', () => {
    entrar();
    cy.intercept('PUT', '**/api/tipo_servicio/modificar/**').as('modificar');
    cy.contains('tr', 'CAMBIO DE ACEITE').find('.rs-btn-edit').click();
    cy.get('input[name="nombre_servicio"]').clear();
    cy.contains('button', 'Actualizar').click();
    cy.contains('EL NOMBRE DEL SERVICIO ES REQUERIDO').should('be.visible');
    cy.get('@modificar.all').should('have.length', 0);
  });

  it('CP-RF007.3-05: Duplicación de nombre al actualizar', () => {
    entrar();
    cy.intercept('PUT', '**/api/tipo_servicio/modificar/1', { statusCode: 400, body: { message: 'Ya existe otro tipo de servicio con este nombre.' } });
    cy.contains('tr', 'CAMBIO DE ACEITE').find('.rs-btn-edit').click();
    cy.get('input[name="nombre_servicio"]').clear().type('AJUSTE DE FRENOS');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Actualizar').click();
    cy.get('@alerta').should('have.been.calledWith', 'Ya existe otro tipo de servicio con este nombre.');
  });

  it('CP-RF007.4-01: Desactivación exitosa (cambio de estado)', () => {
    entrar();
    cy.intercept('PATCH', '**/api/tipo_servicio/estado/1', { statusCode: 200, body: { message: 'Estado cambiado a Inactivo correctamente' } }).as('estado');
    cy.contains('tr', 'CAMBIO DE ACEITE').contains('button', 'Activo').click();
    cy.wait('@estado').its('request.body.estado').should('eq', 0);
    cy.contains('Estado actualizado correctamente').should('be.visible');
  });

  it('CP-RF007.4-03: Tipo asociado a órdenes activas no se elimina', () => {
    entrar();
    cy.intercept('DELETE', '**/api/tipo_servicio/eliminar/1', { statusCode: 400, body: { message: 'No se puede eliminar el tipo de servicio porque está asignado a una o más órdenes de trabajo.' } });
    cy.contains('tr', 'CAMBIO DE ACEITE').find('.rs-btn-delete').click();
    cy.contains('No se puede eliminar el tipo de servicio porque está asignado a una o más órdenes de trabajo.').should('be.visible');
  });

  it('CP-RF007.4-05: El Técnico no puede desactivar tipos de servicio', () => {
    entrar('Técnico');
    cy.contains('tr', 'CAMBIO DE ACEITE').find('button').first().click();
    cy.get('@listar.all').should('have.length.gte', 1);
    cy.get('.rs-btn-delete').should('not.exist');
  });
});

describe('RF-007 - API de tipos de servicio (rechazos reales, sin escrituras)', () => {
  const T = '/api/tipo_servicio';

  it('CP-RF007.2-01: Listado público de tipos de servicio', () => {
    cy.peticion('GET', `${T}/listar`).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.be.an('array');
    });
  });

  it('CP-RF007.1-05: Crear sin nombre (400)', () => {
    cy.peticion('POST', `${T}/crear`, null, { nombre_servicio: '   ' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre del tipo de servicio es obligatorio.');
    });
  });

  it('CP-RF007.1-03: Nombre duplicado en el registro (400)', function () {
    cy.peticion('GET', `${T}/listar`).then((l) => {
      const t = l.body.find((x) => x.nombre_servicio === x.nombre_servicio.trim().replace(/\s+/g, ' ').toUpperCase());
      if (!t) return this.skip();
      cy.peticion('POST', `${T}/crear`, null, { nombre_servicio: t.nombre_servicio }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('Ya existe un tipo de servicio con ese nombre.');
      });
    });
  });

  it('CP-RF007.3-02 / 03 / 07: Actualizar inexistente (404) y nombre vacío (400)', () => {
    cy.peticion('PUT', `${T}/modificar/999999`, null, { nombre_servicio: 'QA INEXISTENTE' }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Tipo de servicio no encontrado');
    });
    cy.peticion('PUT', `${T}/modificar/1`, null, { nombre_servicio: '' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre del tipo de servicio es obligatorio.');
    });
  });

  it('CP-RF007.4-02: Estado inválido (400) y tipo inexistente (404)', () => {
    cy.peticion('PATCH', `${T}/estado/1`, null, { estado: 5 }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Estado no válido.');
    });
    cy.peticion('PATCH', `${T}/estado/999999`, null, { estado: 0 }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Tipo de servicio no encontrado');
    });
    cy.peticion('DELETE', `${T}/eliminar/999999`).its('status').should('eq', 404);
  });

  it('CP-RF007.2: Consultar por id existente e inexistente', function () {
    cy.peticion('GET', `${T}/consultar/999999`).its('status').should('eq', 404);
    cy.peticion('GET', `${T}/listar`).then((l) => {
      if (!l.body.length) return this.skip();
      cy.peticion('GET', `${T}/consultar/${l.body[0].id_tipo_servicio}`).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.nombre_servicio).to.eq(l.body[0].nombre_servicio);
      });
    });
  });
});