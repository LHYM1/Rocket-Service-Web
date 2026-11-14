// cypress/e2e/08-categorias-unidades.cy.js
import { CATEGORIAS, UNIDADES } from '../support/datos';

describe('RF-010 - Categorías de insumos (UI de consulta y API)', () => {
  const entrar = (rol = 'Administrador') => {
    cy.intercept('GET', '**/api/categoria/listar', { body: CATEGORIAS }).as('listar');
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar(rol, '/panel/categoria');
    cy.wait('@listar');
  };

  it('CP-RF010.2-01: Listado completo de categorías por el Administrador', () => {
    entrar();
    cy.contains('Categorías de Insumos').should('be.visible');
    cy.contains('LUBRICANTES').should('be.visible');
    cy.contains('FRENOS').should('be.visible');
    cy.contains('2 categorías registradas').should('be.visible');
  });

  it('CP-RF010.2-02: Búsqueda por nombre con resultados', () => {
    entrar();
    cy.get('.rs-search-input').type('frenos');
    cy.contains('FRENOS').should('be.visible');
    cy.contains('LUBRICANTES').should('not.exist');
  });

  it('CP-RF010.2-03: Búsqueda por nombre sin resultados', () => {
    entrar();
    cy.get('.rs-search-input').type('zzz_inexistente');
    cy.contains('FRENOS').should('not.exist');
    cy.contains('LUBRICANTES').should('not.exist');
  });

  it('CP-RF010.1-05 / 010.3-05 / 010.4-05: Técnico y Cliente no acceden al módulo', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.entrar(rol, '/panel/categoria');
      cy.location('pathname').should('not.eq', '/panel/categoria');
    });
  });

  it('CP-RF010.1: Administrador dispone de la opción Agregar Categoría', () => {
    entrar();
    cy.contains('button', 'Agregar Categoría').should('be.visible');
  });

  describe('API /api/categoria (rechazos reales, sin escrituras)', () => {
    const C = '/api/categoria';
    it('CP-RF010.2-01: Listado con total de insumos numérico', () => {
      cy.peticion('GET', `${C}/listar`).then((r) => {
        expect(r.status).to.eq(200);
        r.body.forEach((c) => {
          expect(c).to.include.keys('id_categoria', 'nombre');
          expect(c.total_insumos).to.be.a('number');
        });
      });
    });
    it('CP-RF010.1-03: Registro sin nombre (400)', () => {
      cy.peticion('POST', `${C}/crear`, null, {}).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('Todos los campos son obligatorios');
      });
    });
    it('CP-RF010.3-02: Actualizar categoría inexistente (404)', () => {
      cy.peticion('PUT', `${C}/modificar/999999`, null, { nombre: 'QA INEXISTENTE', descripcion: 'x' }).then((r) => {
        expect(r.status).to.eq(404);
        expect(r.body.message).to.eq('Registro categoria insumo no encontrado');
      });
    });
    it('CP-RF010.4-02: Eliminar categoría inexistente (404)', () => {
      cy.peticion('DELETE', `${C}/eliminar/999999`).then((r) => {
        expect(r.status).to.eq(404);
        expect(r.body.message).to.eq('Registro de categoria insumo no encontrado');
      });
    });
    it('Consultar categoría inexistente (404) y existente (200)', function () {
      cy.peticion('GET', `${C}/consultar/999999`).its('status').should('eq', 404);
      cy.peticion('GET', `${C}/listar`).then((l) => {
        if (!l.body.length) return this.skip();
        cy.peticion('GET', `${C}/consultar/${l.body[0].id_categoria}`).its('status').should('eq', 200);
      });
    });
  });
});

describe('RF-009 - Unidades de medida (UI con escrituras simuladas)', () => {
  const entrar = () => {
    cy.intercept('GET', '**/api/unidad_de_medida/listar', { body: UNIDADES }).as('listar');
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Administrador', '/panel/unidad');
    cy.wait('@listar');
  };

  it('CP-RF009.2-01: Consulta de unidades de medida', () => {
    entrar();
    cy.get('table.rs-table tbody tr').should('have.length', 2);
    cy.contains('2 unidades registradas').should('be.visible');
  });

  it('CP-RF009.2-02: Búsqueda por nombre (parcial)', () => {
    entrar();
    cy.get('.rs-search-input').type('lit');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'LITRO');
  });

  it('CP-RF009.2-04: Unidad no registrada', () => {
    entrar();
    cy.get('.rs-search-input').type('zzz_inexistente');
    cy.contains('No se encontraron unidades.').should('be.visible');
  });

  it('CP-RF009.2-05: Técnico y Cliente no acceden al módulo', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.entrar(rol, '/panel/unidad');
      cy.location('pathname').should('not.eq', '/panel/unidad');
    });
  });

  it('CP-RF009.1-01: Registro exitoso de unidad de medida', () => {
    entrar();
    cy.intercept('POST', '**/api/unidad_de_medida/crear', { statusCode: 201, body: { message: 'Unidad de medida creada correctamente.', id_unidad: 9 } }).as('crear');
    cy.contains('button', 'Agregar Unidad').click();
    cy.get('input[name="nombre"]').type('GALON');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Guardar').click();
    cy.wait('@crear').its('request.body.nombre').should('eq', 'GALON');
    cy.get('@alerta').should('have.been.calledWith', 'Unidad de medida agregada con éxito');
  });

  it('CP-RF009.1-04: Nombre de unidad duplicado', () => {
    entrar();
    cy.intercept('POST', '**/api/unidad_de_medida/crear', { statusCode: 400, body: { message: 'Ya existe una unidad de medida con ese nombre.' } });
    cy.contains('button', 'Agregar Unidad').click();
    cy.get('input[name="nombre"]').type('LITRO');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Guardar').click();
    cy.get('@alerta').should('have.been.calledWith', 'Hubo un error al guardar el registro');
  });

  it('CP-RF009.3-01: Actualización exitosa de unidad de medida', () => {
    entrar();
    cy.intercept('PUT', '**/api/unidad_de_medida/modificar/1', { statusCode: 200, body: { message: 'ok' } }).as('modificar');
    cy.contains('tr', 'LITRO').find('.rs-btn-edit').click();
    cy.get('input[name="nombre"]').should('have.value', 'LITRO').clear().type('LITROS');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('button', 'Actualizar').click();
    cy.wait('@modificar').its('request.body.nombre').should('eq', 'LITROS');
    cy.get('@alerta').should('have.been.calledWith', 'Unidad de medida actualizada con éxito');
  });

  it('CP-RF009.4-01: Eliminación exitosa con confirmación', () => {
    entrar();
    cy.intercept('DELETE', '**/api/unidad_de_medida/eliminar/2', { statusCode: 200, body: { message: 'ok' } }).as('eliminar');
    cy.contains('tr', 'UNIDAD').find('.rs-btn-delete').click();
    cy.contains('¿Eliminar esta unidad de medida?').should('be.visible');
    cy.contains('button', 'Sí, eliminar').click();
    cy.wait('@eliminar');
    cy.contains('Unidad de medida eliminada con éxito.').should('be.visible');
  });

  it('CP-RF009.4-05: Unidad asociada a insumos no se elimina', () => {
    entrar();
    cy.intercept('DELETE', '**/api/unidad_de_medida/eliminar/1', {
      statusCode: 409,
      body: { message: 'No es posible eliminar esta unidad de medida: está siendo utilizada por 2 insumo(s).' },
    });
    cy.contains('tr', 'LITRO').find('.rs-btn-delete').click();
    cy.contains('button', 'Sí, eliminar').click();
    cy.contains('No es posible eliminar esta unidad de medida: está siendo utilizada por 2 insumo(s).').should('be.visible');
  });

  it('CP-RF009.4: Cancelar la confirmación no elimina', () => {
    entrar();
    cy.intercept('DELETE', '**/api/unidad_de_medida/eliminar/**').as('eliminar');
    cy.contains('tr', 'LITRO').find('.rs-btn-delete').click();
    cy.contains('.rs-modal button', 'Cancelar').click();
    cy.get('@eliminar.all').should('have.length', 0);
  });
});

describe('RF-009 - API de unidades de medida (rechazos reales, sin escrituras)', () => {
  const U = '/api/unidad_de_medida';

  it('CP-RF009.2-01: Listado de unidades', () => {
    cy.peticion('GET', `${U}/listar`).then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.be.an('array');
    });
  });

  it('CP-RF009.1-03: Registro sin nombre (400)', () => {
    cy.peticion('POST', `${U}/crear`, null, { nombre: '  ' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre es obligatorio.');
    });
  });

  it('CP-RF009.1-04: Nombre duplicado (400)', function () {
    cy.peticion('GET', `${U}/listar`).then((l) => {
      if (!l.body.length) return this.skip();
      cy.peticion('POST', `${U}/crear`, null, { nombre: l.body[0].nombre.toLowerCase() }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('Ya existe una unidad de medida con ese nombre.');
      });
    });
  });

  it('CP-RF009.3-03 / 04: Actualizar con nombre vacío (400), duplicado (400) e inexistente (404)', function () {
    cy.peticion('PUT', `${U}/modificar/1`, null, { nombre: '' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre es obligatorio.');
    });
    cy.peticion('PUT', `${U}/modificar/999999`, null, { nombre: 'QA_UNIDAD_INEXISTENTE' }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Unidad de medida no encontrada');
    });
    cy.peticion('GET', `${U}/listar`).then((l) => {
      if (l.body.length < 2) return this.skip();
      cy.peticion('PUT', `${U}/modificar/${l.body[0].id_unidad}`, null, { nombre: l.body[1].nombre }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('Ya existe una unidad de medida con ese nombre.');
      });
    });
  });

  it('CP-RF009.4-05: Unidad asociada a insumos no se elimina (409)', function () {
    cy.peticion('GET', '/api/insumos/listar', 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      cy.peticion('DELETE', `${U}/eliminar/${l.body[0].id_unidad}`).then((r) => {
        expect(r.status).to.eq(409);
        expect(r.body.message).to.include('No es posible eliminar esta unidad de medida');
      });
    });
  });

  it('CP-RF009.4-03: Eliminar unidad inexistente (404)', () => {
    cy.peticion('DELETE', `${U}/eliminar/999999`).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Unidad de medida no encontrada');
    });
  });

  it('Consultar unidad inexistente (404)', () => {
    cy.peticion('GET', `${U}/consultar/999999`).its('status').should('eq', 404);
  });
});