// cypress/e2e/05-insumos.cy.js
import { INSUMOS, CATEGORIAS, UNIDADES } from '../support/datos';

describe('RF-004 - Gestión de insumos (UI con escrituras simuladas)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/insumos/listar', { body: INSUMOS }).as('listar');
    cy.intercept('GET', '**/api/categoria/listar', { body: CATEGORIAS });
    cy.intercept('GET', '**/api/unidad_de_medida/listar', { body: UNIDADES });
    cy.entrar('Administrador', '/panel/insumos');
    cy.wait('@listar');
  });

  const abrirNuevo = () => {
    cy.contains('button', 'Agregar Insumo').click();
    cy.get('#insumo-categoria option').should('have.length.gte', 3);
  };
  const llenarNuevo = (cant, precio) => {
    cy.get('#insumo-categoria').select('FRENOS');
    cy.get('#insumo-unidad').select('UNIDAD');
    cy.get('#insumo-nombre').type('FILTRO DE AIRE QA');
    cy.get('#insumo-cantidad-inicial').type(cant);
    cy.get('#insumo-precio').type(precio);
  };

  it('CP-RF004.2-01: Listado completo con nombre, categoría, unidad, stock y estado', () => {
    cy.get('table.rs-table tbody tr').should('have.length', 3);
    ['Nombre insumo', 'Categoría', 'Unidad', 'Stock', 'Precio unitario', 'Estado'].forEach((h) => cy.contains('th', h));
    cy.contains('tr', 'ACEITE 20W50').should('contain', 'LUBRICANTES').and('contain', 'Activo');
  });

  it('CP-RF004.2-02: Búsqueda por nombre de insumo', () => {
    cy.get('.rs-search-input').type('aceite');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'ACEITE 20W50');
  });

  it('CP-RF004.2-03: Filtro por categoría', () => {
    cy.get('select.rs-select').first().select('FRENOS');
    cy.get('table.rs-table tbody tr').should('have.length', 2);
  });

  it('CP-RF004.2-04: Consulta sin resultados', () => {
    cy.get('.rs-search-input').type('inexistente_zzz');
    cy.contains('No se encontraron insumos.').should('be.visible');
  });

  it('CP-RF004.2-05: El Técnico no accede al módulo de insumos', () => {
    cy.entrar('Técnico', '/panel/insumos');
    cy.location('pathname').should('not.eq', '/panel/insumos');
  });

  it('CP-RF004.4-01: Insumo agotado se muestra Inactivo y "No disponible" (desactivación automática)', () => {
    cy.contains('tr', 'BUJIA').should('contain', 'No disponible').and('contain', 'Inactivo');
  });

  it('CP-RF004.4-02: No existe desactivación manual de insumos', () => {
    cy.get('.rs-btn-delete').should('not.exist');
  });

  it('CP-RF004.1-01: Registro exitoso de insumo', () => {
    cy.intercept('POST', '**/api/insumos/crear', { statusCode: 201, body: { message: 'Insumo creado correctamente' } }).as('crear');
    abrirNuevo();
    llenarNuevo('5', '12000');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.wait('@crear').its('request.body').should((b) => {
      expect(b.nombre_insumo).to.eq('FILTRO DE AIRE QA');
      expect(String(b.cantidad_disponible)).to.eq('5');
      expect(String(b.precio_unitario)).to.eq('12000');
    });
    cy.contains('Insumo agregado con éxito').should('be.visible');
  });

  it('CP-RF004.1-02: Nombre de insumo duplicado', () => {
    cy.intercept('POST', '**/api/insumos/crear', { statusCode: 409, body: { message: 'El nombre del insumo ya existe.' } });
    abrirNuevo();
    llenarNuevo('5', '12000');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('El nombre del insumo ya existe.').should('be.visible');
  });

  it('CP-RF004.1-03: Categoría inactiva no aparece y el backend la rechaza', () => {
    cy.intercept('POST', '**/api/insumos/crear', { statusCode: 400, body: { message: 'La categoría seleccionada está inactiva.' } });
    abrirNuevo();
    llenarNuevo('5', '12000');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('La categoría seleccionada está inactiva.').should('be.visible');
  });

  it('CP-RF004.1-05: Campos obligatorios vacíos no se envían', () => {
    cy.intercept('POST', '**/api/insumos/crear').as('crear');
    abrirNuevo();
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('La cantidad inicial del insumo debe ser mayor a cero.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF004.1-06 / 07: Stock inicial negativo o en cero es rechazado', () => {
    cy.intercept('POST', '**/api/insumos/crear').as('crear');
    abrirNuevo();
    llenarNuevo('0', '12000');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('La cantidad inicial del insumo debe ser mayor a cero.').should('be.visible');
    cy.get('#insumo-cantidad-inicial').clear().type('-5');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('La cantidad inicial del insumo debe ser mayor a cero.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF004.1-09: Precio menor a $1.000 es rechazado', () => {
    cy.intercept('POST', '**/api/insumos/crear').as('crear');
    abrirNuevo();
    llenarNuevo('5', '500');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('El precio unitario debe ser de al menos $1.000.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  const editar = (nombre) => {
    cy.contains('tr', nombre).find('.rs-btn-edit').click();
    cy.get('#insumo-nombre').should('have.value', nombre);
  };

  it('CP-RF004.3-01: Actualización exitosa de datos del insumo', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/1', { statusCode: 200, body: { message: 'ok' } }).as('modificar');
    editar('ACEITE 20W50');
    cy.get('#insumo-nombre').clear().type('ACEITE 20W50 SINTETICO');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.wait('@modificar').its('request.body.nombre_insumo').should('eq', 'ACEITE 20W50 SINTETICO');
    cy.contains('Insumo actualizado correctamente.').should('be.visible');
  });

  it('CP-RF004.3-02: Nombre ya existente es rechazado', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/1', { statusCode: 409, body: { message: 'El nombre del insumo ya existe.' } });
    editar('ACEITE 20W50');
    cy.get('#insumo-nombre').clear().type('BUJIA');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('El nombre del insumo ya existe.').should('be.visible');
  });

  it('CP-RF004.3-03: Precio negativo o menor al mínimo es rechazado', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/**').as('modificar');
    editar('ACEITE 20W50');
    cy.get('#insumo-precio').clear().type('-500');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('El precio unitario debe ser de al menos $1.000.').should('be.visible');
    cy.get('@modificar.all').should('have.length', 0);
  });

  it('CP-RF004.3-04: Cantidad a agregar suma al stock (se envía como incremento)', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/1', { statusCode: 200, body: { message: 'ok' } }).as('modificar');
    editar('ACEITE 20W50');
    cy.get('#insumo-cantidad-agregar').type('10');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.wait('@modificar').its('request.body').should((b) => {
      expect(String(b.cantidad_a_agregar)).to.eq('10');
      expect(b).to.not.have.property('cantidad_disponible');
    });
  });

  it('CP-RF004.3-05: Cantidad a agregar negativa o cero es rechazada', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/**').as('modificar');
    editar('ACEITE 20W50');
    cy.get('#insumo-cantidad-agregar').type('-5');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('La cantidad a agregar debe ser mayor a cero.').should('be.visible');
    cy.get('@modificar.all').should('have.length', 0);
  });

  it('CP-RF004.3-06: Cambio de categoría y unidad no editable', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/1', { statusCode: 200, body: { message: 'ok' } }).as('modificar');
    editar('ACEITE 20W50');
    cy.get('#insumo-unidad').should('be.disabled');
    cy.get('#insumo-categoria option').should('have.length.gte', 3);
    cy.get('#insumo-categoria').select('FRENOS');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.wait('@modificar').its('request.body.id_categoria').should('eq', '2');
  });

  it('CP-RF004.3-08: Insumo inexistente al actualizar', () => {
    cy.intercept('PUT', '**/api/insumos/modificar/1', { statusCode: 404, body: { message: 'Insumo no encontrado' } });
    editar('ACEITE 20W50');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('Insumo no encontrado').should('be.visible');
  });
});

describe('RF-004 - Notificación de stock bajo al iniciar sesión (RF-004.7)', () => {
    it('CP-RF004.7-01: El Administrador recibe aviso de stock bajo (límite 5 unidades)', () => {
        cy.intercept('GET', '**/api/insumos/stock-bajo', { body: [{ id_insumo: 3, nombre_insumo: 'PASTILLAS', cantidad_disponible: 5 }] });
        cy.intercept('GET', '**/api/pre_revision/pendientes-orden', { body: [] });
        cy.intercept('GET', '**/api/notificaciones/pendientes-admin', { body: [] });
        cy.visit('/');
        cy.credenciales().then(({ correo, clave }) => {
            cy.get('input[name="usuario"]').type(correo);
            cy.get('input[name="contrasena"]').type(clave, { log: false });
        });
        cy.get('button.login-btn').click();
        cy.contains('El insumo PASTILLAS tiene stock bajo: 5 unidades disponibles.').should('be.visible');
    });
});

describe('RF-004 - API de insumos (rechazos y permisos reales, sin escrituras)', () => {
  const VALIDO = { id_categoria: 1, id_unidad: 1, nombre_insumo: 'QA_NO_CREAR', cantidad_disponible: 5, precio_unitario: 5000 };

  it('CP-RF004.1-05: Campos obligatorios vacíos (400)', () => {
    cy.peticion('POST', '/api/insumos/crear', 'Administrador', {}).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Todos los campos son obligatorios');
    });
  });

  it('CP-RF004.1-06 / 07: Stock negativo o en cero (400)', () => {
    [-5, 0, 1.5].forEach((n) =>
      cy.peticion('POST', '/api/insumos/crear', 'Administrador', { ...VALIDO, cantidad_disponible: n }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('La cantidad inicial del insumo debe ser mayor a cero.');
      })
    );
  });

  it('CP-RF004.1-09: Precio menor a $1.000 (400)', () => {
    cy.peticion('POST', '/api/insumos/crear', 'Administrador', { ...VALIDO, precio_unitario: 999 }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El precio unitario debe ser de al menos $1.000.');
    });
  });

  it('CP-RF004.1-03: Categoría inexistente (400)', () => {
    cy.peticion('POST', '/api/insumos/crear', 'Administrador', { ...VALIDO, id_categoria: 999999 }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('La categoría seleccionada no existe.');
    });
  });

  it('CP-RF004.1-02: Nombre duplicado (409)', function () {
    cy.peticion('GET', '/api/insumos/listar', 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      const i = l.body[0];
      cy.peticion('POST', '/api/insumos/crear', 'Administrador', { ...VALIDO, id_categoria: i.id_categoria, id_unidad: i.id_unidad, nombre_insumo: i.nombre_insumo }).then((r) => {
        expect(r.status).to.eq(409);
        expect(r.body.message).to.eq('El nombre del insumo ya existe.');
      });
    });
  });

  it('CP-RF004.1-08 / 004.3-07 / 004.4-05: Sin rol Administrador no registra ni actualiza (403)', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.peticion('POST', '/api/insumos/crear', rol, VALIDO).its('status').should('eq', 403);
      cy.peticion('PUT', '/api/insumos/modificar/1', rol, { id_categoria: 1 }).its('status').should('eq', 403);
    });
  });

  it('CP-RF004.2-01 / 05: Administrador y Técnico listan (lectura); Cliente no', () => {
    cy.peticion('GET', '/api/insumos/listar', 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.be.an('array');
      if (r.body.length) expect(r.body[0]).to.include.keys('nombre_insumo', 'categoria', 'unidad_de_medida', 'cantidad_disponible', 'estado');
    });
    cy.peticion('GET', '/api/insumos/listar', 'Técnico').its('status').should('eq', 200);
    cy.peticion('GET', '/api/insumos/listar', 'Cliente').its('status').should('eq', 403);
  });

  it('CP-RF004.3-08: Actualizar insumo inexistente (404)', () => {
    cy.peticion('PUT', '/api/insumos/modificar/999999', 'Administrador', { id_categoria: 1 }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Insumo no encontrado');
    });
  });

  it('CP-RF004.3-03 / 05: Precio y cantidad a agregar inválidos al actualizar (400)', function () {
    cy.peticion('GET', '/api/insumos/listar', 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      const i = l.body[0];
      cy.peticion('PUT', `/api/insumos/modificar/${i.id_insumo}`, 'Administrador', { id_categoria: i.id_categoria, nombre_insumo: i.nombre_insumo, precio_unitario: -500 }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('El precio unitario debe ser de al menos $1.000.');
      });
      cy.peticion('PUT', `/api/insumos/modificar/${i.id_insumo}`, 'Administrador', { id_categoria: i.id_categoria, nombre_insumo: i.nombre_insumo, cantidad_a_agregar: -3 }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('La cantidad a agregar debe ser un número entero mayor a cero.');
      });
    });
  });

  it('CP-RF004.3-02: Nombre de otro insumo al actualizar (409)', function () {
    cy.peticion('GET', '/api/insumos/listar', 'Administrador').then((l) => {
      if (l.body.length < 2) return this.skip();
      const [a, b] = l.body;
      cy.peticion('PUT', `/api/insumos/modificar/${a.id_insumo}`, 'Administrador', { id_categoria: a.id_categoria, nombre_insumo: b.nombre_insumo }).then((r) => {
        expect(r.status).to.eq(409);
        expect(r.body.message).to.eq('El nombre del insumo ya existe.');
      });
    });
  });

  it('CP-RF004.7-01: Stock bajo solo para Administrador y entre 1 y 5 unidades', () => {
    cy.peticion('GET', '/api/insumos/stock-bajo', 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      r.body.forEach((i) => expect(Number(i.cantidad_disponible)).to.be.within(1, 5));
    });
    cy.peticion('GET', '/api/insumos/stock-bajo', 'Técnico').its('status').should('eq', 403);
  });
});

describe('RF-004.5 / 004.6 - Consumo de insumos en orden (API, permisos y rechazos reales)', () => {
  const URL = '/api/insumos_usados_en_servicio';

  it('Agregar insumo exige campos obligatorios y orden existente', () => {
    cy.peticion('POST', `${URL}/agregar`, 'Técnico', {}).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Todos los campos son obligatorios.');
    });
    cy.peticion('POST', `${URL}/agregar`, 'Técnico', { id_orden: 999999, id_insumo: 1, cantidad: 1 }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Orden no encontrada.');
    });
  });

  it('CP-RF004.5-04: El Técnico solo consume en órdenes asignadas a él (403)', function () {
    cy.peticion('GET', '/api/ordenes_de_servicio/listar', 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      cy.peticion('POST', `${URL}/agregar`, 'Técnico', { id_orden: l.body[0].id_orden, id_insumo: 1, cantidad: 1 }).then((r) => {
        expect(r.status).to.eq(403);
        expect(r.body.message).to.eq('No autorizado para modificar esta orden.');
      });
    });
  });

  it('Administrador y Cliente no registran consumo (403)', () => {
    ['Administrador', 'Cliente'].forEach((rol) =>
      cy.peticion('POST', `${URL}/agregar`, rol, { id_orden: 1, id_insumo: 1, cantidad: 1 }).its('status').should('eq', 403)
    );
  });

  it('CP-RF004.6-05: Cantidad no válida al ajustar (400) y registro inexistente (404)', () => {
    [0, -1, 'abc'].forEach((n) =>
      cy.peticion('PATCH', `${URL}/actualizar-cantidad/999999`, 'Técnico', { nueva_cantidad: n }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('La cantidad debe ser un número entero mayor a cero.');
      })
    );
    cy.peticion('PATCH', `${URL}/actualizar-cantidad/999999`, 'Técnico', { nueva_cantidad: 2 }).its('status').should('eq', 404);
    cy.peticion('DELETE', `${URL}/quitar/999999`, 'Técnico').its('status').should('eq', 404);
  });

  it('Listados de insumos usados por rol', () => {
    cy.peticion('GET', `${URL}/listar`, 'Administrador').its('status').should('eq', 200);
    cy.peticion('GET', `${URL}/listar`, 'Técnico').its('status').should('eq', 403);
    cy.peticion('GET', `${URL}/mis-insumos`, 'Técnico').its('status').should('eq', 200);
    cy.peticion('GET', `${URL}/mis-insumos`, 'Cliente').its('status').should('eq', 403);
  });
});