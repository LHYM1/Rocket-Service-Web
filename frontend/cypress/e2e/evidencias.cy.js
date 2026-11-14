// cypress/e2e/10-evidencias.cy.js
import { ORDEN, INSUMOS, TIPOS_SERVICIO } from '../support/datos';

const FOTOS = [
  { id_imagen: 1, id_orden: 2, url_imagen: 'https://res.cloudinary.com/demo/image/upload/dano.jpg', tipo: 'Daño', descripcion: 'Rayón guardabarros' },
  { id_imagen: 2, id_orden: 2, url_imagen: 'https://res.cloudinary.com/demo/image/upload/rep.jpg', tipo: 'Reparación', descripcion: 'Guardabarros reparado' },
];
const IMG = { fileName: 'evidencia.jpg', mimeType: 'image/jpeg', contents: Cypress.Buffer.from('imagen-simulada') };

describe('RF-011 - Evidencias fotográficas: Técnico (Cloudinary simulado)', () => {
  const PROCESO = ORDEN({ id_orden: 2, codigo_orden: 'ORD-002', nombre_estado: 'EN PROCESO' });
  beforeEach(() => {
    cy.intercept('GET', '**/api/insumos/listar', { body: INSUMOS });
    cy.intercept('GET', '**/api/tipo_servicio/listar', { body: TIPOS_SERVICIO });
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.intercept('GET', '**/api/ordenes_de_servicio/mis-ordenes', { body: [PROCESO] }).as('mis');
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/2', { body: { ...PROCESO, insumos: [], total: 0 } });
    cy.entrar('Técnico', '/panel/orders');
    cy.wait('@mis');
    cy.contains('button', 'Agregar foto').click();
    cy.get('.rs-modal').should('be.visible');
  });

  it('CP-RF011.1-01: Registro exitoso de evidencia de daño', () => {
    cy.intercept('POST', '**/api/imagenes_danos/crear', { statusCode: 201, body: { id_imagen: 9 } }).as('crear');
    cy.get('.rs-modal input[type="file"]').selectFile(IMG);
    cy.get('.rs-modal textarea').type('Rayón en el guardabarros');
    cy.contains('.rs-modal button', 'Subir foto').click();
    cy.wait('@crear').its('request.headers.content-type').should('include', 'multipart/form-data');
    cy.contains('Foto agregada correctamente.').should('be.visible');
  });

  it('CP-RF011.1-02: Registro exitoso de evidencia de reparación', () => {
    cy.intercept('POST', '**/api/imagenes_danos/crear', { statusCode: 201, body: { id_imagen: 10 } }).as('crear');
    cy.contains('label', 'Reparación realizada').find('input').check();
    cy.get('.rs-modal input[type="file"]').selectFile(IMG);
    cy.contains('.rs-modal button', 'Subir foto').click();
    cy.wait('@crear');
    cy.contains('Foto agregada correctamente.').should('be.visible');
  });

  it('CP-RF011.1-04: Sin archivo seleccionado no se envía', () => {
    cy.intercept('POST', '**/api/imagenes_danos/crear').as('crear');
    cy.contains('.rs-modal button', 'Subir foto').click();
    cy.contains('Selecciona una foto primero.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF011.1-05: Archivo rechazado por el servidor muestra el motivo', () => {
    cy.intercept('POST', '**/api/imagenes_danos/crear', { statusCode: 400, body: { message: 'Solo se permiten imágenes' } });
    cy.get('.rs-modal input[type="file"]').selectFile({ fileName: 'doc.pdf', mimeType: 'application/pdf', contents: Cypress.Buffer.from('x') });
    cy.contains('.rs-modal button', 'Subir foto').click();
    cy.contains('Solo se permiten imágenes').should('be.visible');
  });

  it('CP-RF011.1-08: Previsualización y quitar la foto seleccionada', () => {
    cy.get('.rs-modal input[type="file"]').selectFile(IMG);
    cy.get('.rs-modal img[alt="preview"]').should('be.visible');
    cy.get('.rs-modal button[title="Quitar foto seleccionada"]').click();
    cy.get('.rs-modal img[alt="preview"]').should('not.exist');
  });
});

describe('RF-011.1-07 - Pre-revisión exige evidencia fotográfica (Técnico)', () => {
  const PR = [{ id_pre_revision: 1, fecha_pre_revision: '2026-11-05', estado: 'PENDIENTE', resultado: null, cliente: 'Ana Ruiz', placa: 'ABC 12D', observaciones: null }];
  beforeEach(() => {
    cy.intercept('GET', '**/api/pre_revision/listar**', { body: PR }).as('listar');
    cy.intercept('GET', '**/api/tipo_servicio/listar', { body: TIPOS_SERVICIO });
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Técnico', '/panel/pre-revision');
    cy.wait('@listar');
    cy.contains('Mis Pre-revisiones').should('be.visible');
    cy.contains('button', 'Aceptar Pre-Revisión').click();
  });

  it('Observaciones obligatorias', () => {
    cy.contains('.rs-modal button', 'Confirmar resultado').click();
    cy.contains('Las observaciones son obligatorias.').should('be.visible');
  });

  it('Bloquea confirmar el resultado sin al menos una foto', () => {
    cy.intercept('PATCH', '**/api/pre_revision/completar/1').as('completar');
    cy.get('.rs-modal textarea').type('Cadena floja y desgaste en frenos');
    cy.get('.rs-modal select').select('1');
    cy.get('input[value="Requiere reparación"]').check();
    cy.contains('.rs-modal button', 'Confirmar resultado').click();
    cy.contains('Debe adjuntar al menos una foto antes de confirmar el resultado.').should('be.visible');
    cy.get('@completar.all').should('have.length', 0);
  });

  it('Completa la pre-revisión con foto adjunta', () => {
    cy.intercept('POST', '**/api/pre_revision/1/fotos', { statusCode: 201, body: { id_foto: 1, url_imagen: 'https://res.cloudinary.com/demo/image/upload/pr.jpg' } }).as('foto');
    cy.intercept('PATCH', '**/api/pre_revision/completar/1', {
      statusCode: 200,
      body: { message: 'Pre-revisión completada. Se ha notificado al Administrador para crear la orden de servicio.' },
    }).as('completar');
    cy.get('.rs-modal textarea').type('Cadena floja y desgaste en frenos');
    cy.get('.rs-modal select').select('1');
    cy.get('.rs-modal input[type="file"]').selectFile(IMG);
    cy.get('input[value="Requiere reparación"]').check();
    cy.contains('.rs-modal button', 'Confirmar resultado').click();
    cy.wait('@foto');
    cy.wait('@completar').its('request.body').should((b) => {
      expect(b.resultado).to.eq('Requiere reparación');
      expect(b.observaciones).to.eq('Cadena floja y desgaste en frenos');
    });
    cy.contains('Pre-revisión completada. Se ha notificado al Administrador para crear la orden de servicio.').should('be.visible');
  });
});

describe('RF-011.2 - Consulta de evidencias (Administrador, Técnico y Cliente)', () => {
  it('CP-RF011.2-04: El Cliente consulta las evidencias de su orden (pestañas Daños y Reparaciones)', () => {
    const O = ORDEN({ id_orden: 2, codigo_orden: 'ORD-002', nombre_estado: 'EN PROCESO' });
    cy.intercept('GET', '**/api/ordenes_de_servicio/listar', { body: [O] }).as('listar');
    cy.intercept('GET', '**/api/notificaciones/no-leidas-por-orden', { body: [{ id_orden: 2, cantidad: 1 }] });
    cy.intercept('PATCH', '**/api/notificaciones/marcar-leidas-orden/2', { statusCode: 200, body: {} }).as('leidas');
    cy.intercept('GET', '**/api/imagenes_danos/por-orden/2', { body: FOTOS });
    cy.entrar('Cliente', '/panel/orders');
    cy.wait('@listar');
    cy.contains('button', 'Evidencias').click();
    cy.wait('@leidas');
    cy.contains('Evidencias — ORD-002').should('be.visible');
    cy.get('.rs-modal img[alt="Rayón guardabarros"]').should('exist');
    cy.contains('.rs-modal button', 'Reparaciones').click();
    cy.get('.rs-modal img[alt="Guardabarros reparado"]').should('exist');
  });

  it('CP-RF011.2-06: Sección sin evidencias se muestra vacía sin error', () => {
    cy.intercept('GET', '**/api/ordenes_de_servicio/listar', { body: [ORDEN({ id_orden: 2, codigo_orden: 'ORD-002', nombre_estado: 'EN PROCESO' })] }).as('listar');
    cy.intercept('GET', '**/api/notificaciones/no-leidas-por-orden', { body: [] });
    cy.intercept('GET', '**/api/imagenes_danos/por-orden/2', { body: [] });
    cy.entrar('Cliente', '/panel/orders');
    cy.wait('@listar');
    cy.contains('button', 'Evidencias').click();
    cy.contains('Aún no hay fotos de daños para esta orden.').should('be.visible');
    cy.contains('.rs-modal button', 'Reparaciones').click();
    cy.contains('Aún no hay fotos de reparaciones para esta orden.').should('be.visible');
  });

  it('CP-RF011.2-01: El Administrador consulta evidencias desde el seguimiento de la orden', () => {
    cy.intercept('GET', '**/api/ordenes_de_servicio/listar', { body: [ORDEN({ id_orden: 2, codigo_orden: 'ORD-002', nombre_estado: 'EN PROCESO' })] }).as('listar');
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/**', { body: { ...ORDEN({ id_orden: 2 }), insumos: [], total: 0 } });
    cy.intercept('GET', '**/api/insumos/listar', { body: INSUMOS });
    cy.intercept('GET', '**/api/tipo_servicio/listar', { body: TIPOS_SERVICIO });
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.intercept('GET', '**/api/imagenes_danos/por-orden/2', { body: FOTOS });
    cy.entrar('Administrador', '/panel/orders');
    cy.wait('@listar');
    cy.contains('button', 'Seguimiento').click();
    cy.contains('Evidencias fotográficas').should('be.visible');
    cy.get('img[alt="Evidencia 1"]').should('exist');
    cy.get('img[alt="Evidencia 2"]').click({ force: true });
    cy.contains('Doble clic o scroll para acercar').should('be.visible');
    cy.get('body').type('{esc}');
    cy.contains('Doble clic o scroll para acercar').should('not.exist');
  });
});

describe('RF-011.3 - Eliminar evidencia (Administrador, escritura simulada)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/imagenes_danos/listar', { body: FOTOS.map((f) => ({ ...f, codigo_orden: 'ORD-002', nombre_cliente: 'Ana Ruiz', nombre_tecnico: 'Mario Pérez' })) }).as('listar');
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Administrador', '/panel/imagenes-danos');
    cy.wait('@listar');
  });

  it('CP-RF011.3-01 / 02: Solicita confirmación y elimina la evidencia', () => {
    cy.intercept('DELETE', '**/api/imagenes_danos/eliminar/1', { statusCode: 200, body: { message: 'Imagen daño eliminada' } }).as('eliminar');
    cy.get('.rs-foto-card').should('have.length', 2);
    cy.get('.rs-foto-card').first().find('.rs-foto-delete').click({ force: true });
    cy.contains('¿Eliminar esta imagen?').should('be.visible');
    cy.contains('button', 'Sí, eliminar').click();
    cy.wait('@eliminar');
    cy.contains('Imagen eliminada correctamente.').should('be.visible');
  });

  it('CP-RF011.3-02b: Cancelar la confirmación no elimina', () => {
    cy.intercept('DELETE', '**/api/imagenes_danos/eliminar/**').as('eliminar');
    cy.get('.rs-foto-card').first().find('.rs-foto-delete').click({ force: true });
    cy.contains('.rs-modal button', 'Cancelar').click();
    cy.get('@eliminar.all').should('have.length', 0);
  });

  it('CP-RF011.3-04: Eliminar evidencia inexistente muestra el error', () => {
    cy.intercept('DELETE', '**/api/imagenes_danos/eliminar/1', { statusCode: 404, body: { message: 'Imagen daño no encontrada' } });
    cy.get('.rs-foto-card').first().find('.rs-foto-delete').click({ force: true });
    cy.contains('button', 'Sí, eliminar').click();
    cy.contains('Imagen daño no encontrada').should('be.visible');
  });

  it('Filtros por tipo y búsqueda por orden', () => {
    cy.get('select.rs-select').select('Solo reparaciones');
    cy.get('.rs-foto-card').should('have.length', 1);
    cy.get('select.rs-select').select('Todos los tipos');
    cy.get('.rs-search-input').type('zzz');
    cy.contains('No hay fotos que coincidan con tu búsqueda.').should('be.visible');
  });

  it('CP-RF011.3-03: El Cliente no accede al módulo de imágenes', () => {
    cy.entrar('Cliente', '/panel/imagenes-danos');
    cy.location('pathname').should('not.eq', '/panel/imagenes-danos');
  });
});

describe('RF-011 - API de evidencias (permisos y rechazos reales, sin escrituras)', () => {
  const I = '/api/imagenes_danos';

  it('CP-RF011.2-01 / 02 / 04: Admin, Técnico y Cliente consultan evidencias de una orden', () => {
    ['Administrador', 'Técnico', 'Cliente'].forEach((rol) =>
      cy.peticion('GET', `${I}/por-orden/999999`, rol).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body).to.have.length(0); // CP-RF011.2-06: sin evidencias = vacío sin error
      })
    );
    cy.peticion('GET', `${I}/por-orden/1`).its('status').should('eq', 401);
  });

  it('CP-RF011.1-04: Registrar evidencia sin archivo (400)', () => {
    cy.peticion('POST', `${I}/crear`, 'Técnico', { id_orden: 1, tipo: 'Daño' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('No se seleccionó ninguna imagen');
    });
  });

  it('CP-RF011.1-06: El Cliente no registra ni elimina evidencias (403)', () => {
    cy.peticion('POST', `${I}/crear`, 'Cliente', { id_orden: 1 }).its('status').should('eq', 403);
    cy.peticion('DELETE', `${I}/eliminar/1`, 'Cliente').its('status').should('eq', 403);
    cy.peticion('GET', `${I}/listar`, 'Cliente').its('status').should('eq', 403);
  });

  it('CP-RF011.3-04: Eliminar evidencia inexistente (404)', () => {
    cy.peticion('DELETE', `${I}/eliminar/999999`, 'Administrador').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Imagen daño no encontrada');
    });
  });

  it('Listado completo solo para Administrador y Técnico', () => {
    ['Administrador', 'Técnico'].forEach((rol) => cy.peticion('GET', `${I}/listar`, rol).its('status').should('eq', 200));
  });

  it('Fotos de pre-revisión: solo el Técnico agrega/elimina', () => {
    cy.peticion('DELETE', '/api/pre_revision/fotos/999999', 'Técnico').its('status').should('eq', 404);
    cy.peticion('DELETE', '/api/pre_revision/fotos/1', 'Administrador').its('status').should('eq', 403);
    cy.peticion('PATCH', '/api/pre_revision/completar/999999', 'Técnico', {}).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Pre-revisión no encontrada');
    });
  });
});