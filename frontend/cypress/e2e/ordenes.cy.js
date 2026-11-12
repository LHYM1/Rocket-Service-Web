// frontend/cypress/e2e/06-ordenes.cy.js
import { ORDEN, INSUMOS, TIPOS_SERVICIO, MOTOS, USUARIOS } from '../support/datos';

const base = () => {
  cy.intercept('GET', '**/api/insumos/listar', { body: INSUMOS });
  cy.intercept('GET', '**/api/tipo_servicio/listar', { body: TIPOS_SERVICIO });
  cy.intercept('GET', '**/api/motocicleta/listar', { body: { status: 'success', data: MOTOS } });
  cy.intercept('GET', '**/api/usuarios/listar', { body: USUARIOS });
  cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
  cy.intercept('GET', '**/api/imagenes_danos/por-orden/**', { body: [] });
};

describe('RF-006 - Órdenes: vista del Administrador (escrituras simuladas)', () => {
  const LISTA = [
    ORDEN(),
    ORDEN({ id_orden: 2, codigo_orden: 'ORD-002', nombre_estado: 'EN PROCESO', nombre_cliente: 'Luis Mora', placa_moto: 'XYZ 98K', nombre_modelo: 'NKD 125' }),
    ORDEN({ id_orden: 3, codigo_orden: 'ORD-003', nombre_estado: 'FINALIZADA', nombre_cliente: 'Sara Díaz' }),
    ORDEN({ id_orden: 4, codigo_orden: 'ORD-004', nombre_estado: 'CANCELADA', nombre_cliente: 'Pedro Gil', motivo_rechazo: 'Cliente no autorizó' }),
  ];

  beforeEach(() => {
    base();
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/**', { body: { ...ORDEN(), insumos: [], total: 0 } });
    cy.intercept('GET', '**/api/ordenes_de_servicio/listar', { body: LISTA }).as('listar');
    cy.entrar('Administrador', '/panel/orders');
    cy.wait('@listar');
  });

  it('CP-RF006.2-01: Listado completo de órdenes del Administrador', () => {
    cy.get('.card').should('have.length', 4);
    ['Orden #1', 'Orden #2', 'Orden #3', 'Orden #4'].forEach((t) => cy.contains(t));
  });

  it('CP-RF006.2-03: Filtro/búsqueda por estado', () => {
    cy.get('.rs-search-input').type('FINALIZADA');
    cy.get('.card').should('have.length', 1).and('contain', 'Sara Díaz');
  });

  it('CP-RF006.2-05: Búsqueda sin resultados', () => {
    cy.get('.rs-search-input').type('zzz_inexistente');
    cy.get('.card').should('not.exist');
    cy.contains('No tienes órdenes asignadas').should('be.visible');
  });

  it('CP-RF006.1-06: Las órdenes se crean desde una pre-revisión (no hay formulario directo)', () => {
    cy.contains('Las órdenes se crean desde una').should('be.visible');
    cy.contains('a', 'Ir a Pre-revisiones').should('have.attr', 'href', '/panel/pre-revision');
  });

  it('CP-RF006.6-01: Administrador visualiza el seguimiento/historial de la orden', () => {
    cy.contains('.card', 'Orden #1').contains('button', 'Seguimiento').click();
    cy.contains('ORD-001').should('be.visible');
    cy.contains('Evidencias fotográficas').should('be.visible');
    cy.contains('Descripción del problema').should('be.visible');
    cy.contains('Ruido en el motor').should('be.visible');
  });

  it('CP-RF006.6-02: Seguimiento de orden cancelada muestra el motivo', () => {
    cy.contains('.card', 'Orden #4').contains('button', 'Seguimiento').click();
    cy.contains('Orden cancelada').should('be.visible');
    cy.contains('Cliente no autorizó').should('be.visible');
  });

  it('CP-RF006.4-01: Cancelación exitosa de una orden ASIGNADA', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/cancelar/1', { statusCode: 200, body: { message: 'Orden cancelada correctamente.' } }).as('cancelar');
    cy.contains('.card', 'Orden #1').contains('button', 'Cancelar').click();
    cy.contains('¿Cancelar esta orden?').should('be.visible');
    cy.contains('button', 'Sí, cancelar').click();
    cy.wait('@cancelar').its('request.body.motivo').should('eq', '');
    cy.contains('Orden cancelada correctamente.').should('be.visible');
  });

  it('CP-RF006.4-01b: Cancelar es reversible desde el modal (Cancelar acción)', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/cancelar/**').as('cancelar');
    cy.contains('.card', 'Orden #1').contains('button', 'Cancelar').click();
    cy.contains('.rs-modal button', 'Cancelar').click();
    cy.get('@cancelar.all').should('have.length', 0);
  });

  it('CP-RF006.4-05: Orden EN PROCESO exige motivo; con motivo cancela', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/cancelar/2', { statusCode: 200, body: { message: 'Orden cancelada correctamente.' } }).as('cancelar');
    cy.window().then((win) => cy.stub(win, 'prompt').returns('').as('prompt'));
    cy.contains('.card', 'Orden #2').contains('button', 'Cancelar').click();
    cy.contains('button', 'Sí, cancelar').click();
    cy.contains('El motivo es obligatorio para cancelar una orden en proceso.').should('be.visible');
    cy.get('@cancelar.all').should('have.length', 0);
    cy.window().then((win) => win.prompt.returns('Cliente desiste'));
    cy.contains('button', 'Sí, cancelar').click();
    cy.wait('@cancelar').its('request.body.motivo').should('eq', 'Cliente desiste');
  });

  it('CP-RF006.4-03 / 04: Órdenes FINALIZADA y CANCELADA no se pueden cancelar', () => {
    ['Orden #3', 'Orden #4'].forEach((t) => cy.contains('.card', t).find('button.btn-danger').should('be.disabled'));
  });

  it('CP-RF006.4-06: El Técnico no ve el botón Cancelar', () => {
    cy.intercept('GET', '**/api/ordenes_de_servicio/mis-ordenes', { body: [ORDEN()] });
    cy.entrar('Técnico', '/panel/orders');
    cy.contains('.card', 'Orden #1').should('be.visible');
    cy.contains('button', 'Cancelar').should('not.exist');
  });
});

describe('RF-006.3 / 006.7 / RF-004.5 - Órdenes: vista del Técnico (escrituras simuladas)', () => {
  const ASIGNADA = ORDEN();
  const PROCESO = ORDEN({ id_orden: 2, codigo_orden: 'ORD-002', nombre_estado: 'EN PROCESO' });

  beforeEach(() => {
    base();
    cy.intercept('GET', '**/api/ordenes_de_servicio/mis-ordenes', { body: [ASIGNADA, PROCESO] }).as('mis');
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/2', { body: { ...PROCESO, insumos: [], total: 0 } }).as('detalle');
    cy.entrar('Técnico', '/panel/orders');
    cy.wait('@mis');
  });

  it('CP-RF006.2-06: El Técnico ve solo sus órdenes asignadas', () => {
    cy.contains('Mis Órdenes').should('be.visible');
    cy.get('.card').should('have.length', 2);
    cy.contains('button', 'Seguimiento').should('not.exist');
  });

  it('CP-RF006.3-01: Aceptar orden ASIGNADA la pasa a EN PROCESO', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/aceptar/1', { statusCode: 200, body: { message: 'Orden aceptada correctamente.' } }).as('aceptar');
    cy.contains('.card', 'Orden #1').contains('button', 'Aceptar Orden').click();
    cy.wait('@aceptar');
    cy.contains('Orden aceptada correctamente.').should('be.visible');
  });

  it('CP-RF011.1-06: En ASIGNADA no se pueden subir fotos hasta aceptar la orden', () => {
    cy.contains('.card', 'Orden #1').contains('button', 'Agregar foto').should('be.disabled');
    cy.contains('.card', 'Orden #2').contains('button', 'Agregar foto').should('not.be.disabled');
  });

  it('CP-RF006.3-04: Transición no permitida es rechazada por el backend', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/aceptar/1', { statusCode: 400, body: { message: 'Solo se pueden aceptar órdenes en estado ASIGNADA.' } });
    cy.contains('.card', 'Orden #1').contains('button', 'Aceptar Orden').click();
    cy.contains('Solo se pueden aceptar órdenes en estado ASIGNADA.').should('be.visible');
  });

  it('CP-RF006.3-06: Orden en estado final no se puede modificar', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/aceptar/1', { statusCode: 400, body: { message: 'No se puede modificar una orden en estado FINALIZADA.' } });
    cy.contains('.card', 'Orden #1').contains('button', 'Aceptar Orden').click();
    cy.contains('No se puede modificar una orden en estado FINALIZADA.').should('be.visible');
  });

  it('CP-RF004.5-01: Cotización: agregar insumo, ver total y enviar al cliente', () => {
    cy.intercept('POST', '**/api/insumos_usados_en_servicio/agregar', { statusCode: 201, body: { message: 'Insumo agregado correctamente.' } }).as('agregar');
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/enviar-cotizacion/2', { statusCode: 200, body: { message: 'Cotización enviada al cliente correctamente.' } }).as('enviar');
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.contains('Cotización de insumos').should('be.visible');
    cy.get('.panel-revision select').select('1');
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/2', {
      body: { ...PROCESO, insumos: [{ id_insumos_orden: 1, id_insumo: 1, nombre_insumo: 'ACEITE 20W50', cantidad: 1, precio_unitario_snapshot: 25000, nombre_unidad: 'L' }], total: 25000 },
    });
    cy.get('.panel-revision i.fa-plus').parent().click();
    cy.wait('@agregar').its('request.body').should((b) => {
      expect(b.id_orden).to.eq(2);
      expect(b.id_insumo).to.eq(1);
      expect(b.cantidad).to.eq(1);
    });
    cy.contains('Insumo agregado correctamente.').should('be.visible');
    cy.contains(/Total:\s*\$25[.,]000/).should('be.visible');
    cy.contains('button', 'Enviar cotización').click();
    cy.wait('@enviar');
    cy.contains('Cotización enviada al cliente correctamente.').should('be.visible');
  });

  it('CP-RF004.5-02 / 04.6-04: Cantidad mayor al stock es rechazada', () => {
    cy.intercept('POST', '**/api/insumos_usados_en_servicio/agregar', { statusCode: 400, body: { message: 'La cantidad solicitada supera el stock disponible.' } });
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.get('.panel-revision select').select('1');
    cy.get('.panel-revision input[type="number"]').clear().type('99');
    cy.get('.panel-revision i.fa-plus').parent().click();
    cy.contains('La cantidad solicitada supera el stock disponible.').should('be.visible');
  });

  it('CP-RF004.5-05: El mismo insumo no se agrega dos veces', () => {
    cy.intercept('POST', '**/api/insumos_usados_en_servicio/agregar', { statusCode: 409, body: { message: 'Este insumo ya fue agregado a la orden.' } });
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.get('.panel-revision select').select('1');
    cy.get('.panel-revision i.fa-plus').parent().click();
    cy.contains('Este insumo ya fue agregado a la orden.').should('be.visible');
  });

  it('CP-RF004.5-06: Insumos inactivos o sin stock no aparecen en el selector', () => {
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.get('.panel-revision select option').then(($o) => {
      const t = [...$o].map((x) => x.textContent);
      expect(t.join('|')).to.include('ACEITE 20W50').and.to.include('PASTILLAS');
      expect(t.join('|')).to.not.include('BUJIA');
    });
  });

  // 06-ordenes.cy.js  
  it('CP-RF004.5-07: Quitar un insumo devuelve el stock', () => {
    cy.wait('@detalle'); // esperar la consulta inicial de la pantalla antes de cambiar el intercept
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/2', {
      body: { ...PROCESO, insumos: [{ id_insumos_orden: 7, id_insumo: 1, nombre_insumo: 'ACEITE 20W50', cantidad: 2, precio_unitario_snapshot: 25000, nombre_unidad: 'L' }], total: 50000 },
    }).as('detalleConInsumos');
    cy.intercept('DELETE', '**/api/insumos_usados_en_servicio/quitar/7', { statusCode: 200, body: { message: 'Insumo eliminado y stock restaurado.' } }).as('quitar');
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.wait('@detalleConInsumos');
    cy.get('.panel-revision i.fa-trash').parent().click();
    cy.wait('@quitar');
    cy.contains('Insumo eliminado y stock restaurado.').should('be.visible');
  });

  it('CP-RF004.6-09: Enviar cotización sin insumos no se envía', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/enviar-cotizacion/**').as('enviar');
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.contains('button', 'Enviar cotización').click();
    cy.contains('Agrega al menos un insumo antes de enviar la cotización.').should('be.visible');
    cy.get('@enviar.all').should('have.length', 0);
  });

  it('CP-RF006.3-02: Finalizar directo solo con total en $0', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/finalizar/2', { statusCode: 200, body: { message: 'Orden finalizada correctamente.' } }).as('finalizar');
    cy.contains('.card', 'Orden #2').contains('button', 'Cotizar / Finalizar').click();
    cy.contains('button', 'Finalizar directo').should('not.be.disabled').click();
    cy.contains('¿Finalizar directo, sin pasar por el cliente?').should('be.visible');
    cy.contains('button', 'Sí, finalizar directo').click();
    cy.wait('@finalizar');
    cy.contains('Orden finalizada correctamente.').should('be.visible');
  });

  it('CP-RF006.3-08: Edición rápida de tipo de servicio, problema y fecha', () => {
    cy.intercept('PUT', '**/api/ordenes_de_servicio/modificar/2', { statusCode: 200, body: { message: 'Orden de servicio actualizada exitosamente.' } }).as('modificar');
    cy.contains('.card', 'Orden #2').find('button[title="Editar"]').click();
    cy.contains('.card', 'Orden #2').find('textarea').clear().type('Falla en frenos');
    cy.contains('.card', 'Orden #2').contains('button', 'Guardar cambios').click();
    cy.wait('@modificar').its('request.body.descripcion_del_problema').should('eq', 'Falla en frenos');
    cy.contains('Orden de servicio actualizada exitosamente.').should('be.visible');
  });
});

describe('RF-006.10 - Órdenes: vista del Cliente (escrituras simuladas)', () => {
  const PEND = ORDEN({ id_orden: 5, codigo_orden: 'ORD-005', nombre_estado: 'PENDIENTE APROBACIÓN' });
  const FIN = ORDEN({ id_orden: 6, codigo_orden: 'ORD-006', nombre_estado: 'FINALIZADA' });

  beforeEach(() => {
    base();
    cy.intercept('GET', '**/api/notificaciones/no-leidas-por-orden', { body: [{ id_orden: 5, cantidad: 2 }] });
    cy.intercept('GET', '**/api/calificaciones/orden/**', { statusCode: 404, body: {} });
    cy.intercept('GET', '**/api/ordenes_de_servicio/consultar/5', {
      body: { ...PEND, insumos: [{ id_insumos_orden: 1, nombre_insumo: 'ACEITE 20W50', cantidad: 2, precio_unitario_snapshot: 25000 }], total: 50000 },
    });
  });

  const entrar = (lista) => {
    cy.intercept('GET', '**/api/ordenes_de_servicio/listar', { body: lista }).as('listar');
    cy.entrar('Cliente', '/panel/orders');
    cy.wait('@listar');
  };

  it('CP-RF006.2-07: El Cliente ve solo el seguimiento de sus órdenes', () => {
    entrar([PEND]);
    cy.contains('Seguimiento de mi Orden').should('be.visible');
    cy.get('.card').should('have.length', 1).and('contain', 'ORD-005');
    cy.contains('button', 'Cancelar').should('not.exist');
  });

  it('CP-RF006.10-01: Ver cotización y aprobarla', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/aprobar/5', { statusCode: 200, body: { message: 'Has aprobado la cotización. Tu moto está en proceso de reparación.' } }).as('aprobar');
    entrar([PEND]);
    cy.contains('button', 'Ver cotización').click();
    cy.contains('ACEITE 20W50 x2').should('be.visible');
    cy.contains(/\$50[.,]000/).should('be.visible');
    cy.contains('button', 'Aprobar').click();
    cy.contains('¿Apruebas esta cotización?').should('be.visible');
    cy.contains('button', 'Sí, aprobar').click();
    cy.wait('@aprobar');
    cy.contains('Has aprobado la cotización. Tu moto está en proceso de reparación.').should('be.visible');
  });

  it('CP-RF006.10-02: Rechazo con cancelación exige tipo y motivo', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/rechazar/5', { statusCode: 200, body: { message: 'La orden fue cancelada.' } }).as('rechazar');
    entrar([PEND]);
    cy.contains('button', 'Rechazar').click();
    cy.contains('.rs-modal button', 'Enviar').click();
    cy.contains('Selecciona si quieres cancelar la orden o pedir un reajuste.').should('be.visible');
    cy.contains('label', 'Cancelar la orden por completo').find('input').check();
    cy.contains('.rs-modal button', 'Enviar').click();
    cy.contains('Debe ingresar el motivo de su rechazo.').should('be.visible');
    cy.get('.rs-modal textarea').type('Muy costoso');
    cy.contains('.rs-modal button', 'Enviar').click();
    cy.wait('@rechazar').its('request.body').should((b) => {
      expect(b.tipo_rechazo).to.eq('Cancelar');
      expect(b.motivo).to.eq('Muy costoso');
    });
    cy.contains('Lamentamos mucho tu cancelación.').should('be.visible');
  });

  it('CP-RF006.10-03: Rechazo con reajuste devuelve la orden al técnico', () => {
    cy.intercept('PATCH', '**/api/ordenes_de_servicio/rechazar/5', { statusCode: 200, body: { message: 'Se solicitó un reajuste. El técnico recibirá tu motivo para ajustar la cotización.' } }).as('rechazar');
    entrar([PEND]);
    cy.contains('button', 'Rechazar').click();
    cy.contains('label', 'Pedirle al técnico que ajuste la cotización').find('input').check();
    cy.get('.rs-modal textarea').type('Quitar un insumo');
    cy.contains('.rs-modal button', 'Enviar').click();
    cy.wait('@rechazar').its('request.body.tipo_rechazo').should('eq', 'Reajuste');
    cy.contains('Se solicitó un reajuste.').should('be.visible');
  });

  it('CP-RF006.7-01: Orden FINALIZADA avisa al cliente y permite calificar', () => {
    entrar([FIN]);
    cy.contains('¡Tu orden ha sido finalizada!').should('be.visible');
    cy.contains('button', 'Aceptar').click();
    cy.contains('button', 'Calificar servicio').should('be.visible');
  });

  it('CP-RF006.7-02: Orden CANCELADA muestra su estado en la barra de progreso', () => {
    entrar([ORDEN({ id_orden: 8, codigo_orden: 'ORD-008', nombre_estado: 'CANCELADA' })]);
    cy.contains('Orden cancelada').should('be.visible');
  });
});

describe('RF-006 - API de órdenes (permisos y rechazos reales, sin escrituras)', () => {
  const O = '/api/ordenes_de_servicio';

  it('CP-RF006.2-01 / 06 / 07: Listados por rol', () => {
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.be.an('array');
    });
    cy.peticion('GET', `${O}/mis-ordenes`, 'Técnico').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.have.length(0);
    });
    cy.peticion('GET', `${O}/listar`, 'Cliente').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.have.length(0);
    });
    cy.peticion('GET', `${O}/listar`).its('status').should('eq', 401);
  });

  it('CP-RF006.2-02 / 03 / 05: Filtros por código, estado y sin resultados', function () {
    cy.peticion('GET', `${O}/listar?codigo_orden=ZZZ_NO_EXISTE`, 'Administrador').its('body').should('have.length', 0);
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      const o = l.body[0];
      cy.peticion('GET', `${O}/listar?codigo_orden=${o.codigo_orden}`, 'Administrador').then((r) => {
        expect(r.body.length).to.be.greaterThan(0);
        r.body.forEach((x) => expect(x.codigo_orden).to.include(o.codigo_orden));
      });
      cy.peticion('GET', `${O}/listar?estado=${encodeURIComponent(o.nombre_estado)}`, 'Administrador').then((r) =>
        r.body.forEach((x) => expect(x.nombre_estado).to.eq(o.nombre_estado))
      );
    });
  });

  it('CP-RF006.2-04: Filtro por técnico', function () {
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      const o = l.body.find((x) => x.id_tecnico_asignado);
      if (!o) return this.skip();
      cy.peticion('GET', `${O}/listar?id_tecnico=${o.id_tecnico_asignado}`, 'Administrador').then((r) =>
        r.body.forEach((x) => expect(x.id_tecnico_asignado).to.eq(o.id_tecnico_asignado))
      );
    });
  });

  it('CP-RF006.1: Solo el Administrador crea órdenes y se valida la pre-revisión', () => {
    ['Técnico', 'Cliente'].forEach((rol) => cy.peticion('POST', `${O}/crear`, rol, {}).its('status').should('eq', 403));
    cy.peticion('POST', `${O}/crear`, 'Administrador', {}).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Todos los campos son obligatorios');
    });
    cy.peticion('POST', `${O}/crear`, 'Administrador', { id_pre_revision: 999999, id_tecnico_asignado: 1, fecha_finalizacion_estimada: '2030-01-01' }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Pre-revisión no encontrada.');
    });
  });

  it('CP-RF006.5-01: Solo el Administrador ve técnicos disponibles para asignar', () => {
    cy.peticion('GET', `${O}/tecnicos-disponibles`, 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body).to.be.an('array');
    });
    ['Técnico', 'Cliente'].forEach((rol) => cy.peticion('GET', `${O}/tecnicos-disponibles`, rol).its('status').should('eq', 403));
  });

  it('CP-RF006.3-02: Actualizar orden inexistente (404)', () => {
    cy.peticion('PUT', `${O}/modificar/999999`, 'Administrador', { descripcion_del_problema: 'x' }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Orden no encontrada');
    });
  });

  it('CP-RF006.3-05: El Técnico no actualiza ni transiciona órdenes que no son suyas (403)', function () {
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      const id = l.body[0].id_orden;
      cy.peticion('PUT', `${O}/modificar/${id}`, 'Técnico', { descripcion_del_problema: 'x' }).its('status').should('eq', 403);
      ['aceptar', 'enviar-cotizacion', 'finalizar'].forEach((a) =>
        cy.peticion('PATCH', `${O}/${a}/${id}`, 'Técnico').then((r) => {
          expect(r.status).to.eq(403);
          expect(r.body.message).to.include('no eres el técnico asignado');
        })
      );
    });
  });

  it('CP-RF006.3-06: Orden en estado final no se modifica (400)', function () {
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      const o = l.body.find((x) => ['FINALIZADA', 'CANCELADA'].includes(x.nombre_estado));
      if (!o) return this.skip();
      cy.peticion('PUT', `${O}/modificar/${o.id_orden}`, 'Administrador', { descripcion_del_problema: 'x' }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq(`No se puede modificar una orden en estado ${o.nombre_estado}.`);
      });
    });
  });

  it('CP-RF006.3-09: Descripción mayor a 200 caracteres es rechazada (400)', function () {
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      const o = l.body.find((x) => ['ASIGNADA', 'EN PROCESO'].includes(x.nombre_estado));
      if (!o) return this.skip();
      cy.peticion('PUT', `${O}/modificar/${o.id_orden}`, 'Administrador', { descripcion_del_problema: 'a'.repeat(201) }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq('La descripción del problema supera los 200 caracteres.');
      });
    });
  });

  it('CP-RF006.4-02 / 06: Cancelar inexistente (404) y solo Administrador', () => {
    cy.peticion('PATCH', `${O}/cancelar/999999`, 'Administrador', { motivo: 'x' }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Orden no encontrada');
    });
    ['Técnico', 'Cliente'].forEach((rol) => cy.peticion('PATCH', `${O}/cancelar/1`, rol, { motivo: 'x' }).its('status').should('eq', 403));
  });

  it('CP-RF006.4-03 / 04: No se cancela una orden FINALIZADA o CANCELADA (400)', function () {
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      const o = l.body.find((x) => ['FINALIZADA', 'CANCELADA'].includes(x.nombre_estado));
      if (!o) return this.skip();
      cy.peticion('PATCH', `${O}/cancelar/${o.id_orden}`, 'Administrador', { motivo: 'x' }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.eq(`No se puede cancelar una orden en estado ${o.nombre_estado}.`);
      });
    });
  });

  it('CP-RF006.10: Aprobar/rechazar solo el Cliente dueño; inexistente (404)', () => {
    ['Administrador', 'Técnico'].forEach((rol) => {
      cy.peticion('PATCH', `${O}/aprobar/1`, rol).its('status').should('eq', 403);
      cy.peticion('PATCH', `${O}/rechazar/1`, rol, {}).its('status').should('eq', 403);
    });
    cy.peticion('PATCH', `${O}/aprobar/999999`, 'Cliente').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Orden no encontrada.');
    });
  });

  it('CP-RF006.6: Consultar orden inexistente (404) y existente (200)', function () {
    cy.peticion('GET', `${O}/consultar/999999`, 'Administrador').its('status').should('eq', 404);
    cy.peticion('GET', `${O}/listar`, 'Administrador').then((l) => {
      if (!l.body.length) return this.skip();
      cy.peticion('GET', `${O}/consultar/${l.body[0].id_orden}`, 'Administrador').then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body).to.include.keys('insumos', 'total');
      });
    });
  });
});

describe('RF-006.1 - Crear orden desde pre-revisión (escrituras simuladas)', () => {
  const PR = [{ id_pre_revision: 1, fecha_pre_revision: '2026-11-05', estado: 'COMPLETADA', resultado: 'Requiere reparación', id_orden_generada: null, cliente: 'Ana Ruiz', tecnico: 'Mario Pérez', placa: 'ABC 12D' }];

  beforeEach(() => {
    cy.intercept('GET', '**/api/pre_revision/listar**', { body: PR }).as('listar');
    cy.intercept('GET', '**/api/ordenes_de_servicio/tecnicos-disponibles', { body: [{ id_usuario: 13, nombre: 'Mario', apellido: 'Pérez' }] }).as('tecnicos');
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Administrador', '/panel/pre-revision');
    cy.wait('@listar');
    cy.contains('button', 'Crear orden').click();
    cy.wait('@tecnicos');
  });

  it('CP-RF006.1-01: Creación exitosa con código ORD-XXX y estado ASIGNADA', () => {
    const futuro = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0];
    cy.intercept('POST', '**/api/ordenes_de_servicio/crear', {
      statusCode: 201,
      body: { message: 'Orden creada correctamente', codigo_orden: 'ORD-099' },
    }).as('crear');

    cy.get('.rs-modal select').select('13');
    cy.get('.rs-modal input[type="date"]').type(futuro);
    cy.contains('.rs-modal button', 'Crear Orden').click();

    cy.wait('@crear').its('request.body').should((b) => {
      expect(b.id_pre_revision).to.eq(1);
      expect(String(b.id_tecnico_asignado)).to.eq('13');
      expect(b.fecha_finalizacion_estimada).to.eq(futuro);
    });
    cy.contains('Orden creada correctamente (ORD-099)').should('be.visible');
  });

  it('CP-RF006.1-02: Fecha pasada es rechazada', () => {
    cy.intercept('POST', '**/api/ordenes_de_servicio/crear', { statusCode: 400, body: { message: 'La fecha de entrega no puede ser un día anterior a hoy.' } });
    cy.get('.rs-modal input[type="date"]').should('have.attr', 'min', new Date().toISOString().split('T')[0]);
    cy.get('.rs-modal select').select('13');
    cy.get('.rs-modal input[type="date"]').type('2020-01-01');
    cy.contains('.rs-modal button', 'Crear Orden').click();
    cy.contains('La fecha de entrega no puede ser un día anterior a hoy.').should('be.visible');
  });

  it('CP-RF006.1-03: Campos obligatorios vacíos', () => {
    cy.intercept('POST', '**/api/ordenes_de_servicio/crear').as('crear');
    cy.contains('.rs-modal button', 'Crear Orden').click();
    cy.contains('Todos los campos son obligatorios.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF006.1-05: Cancelar cierra el formulario sin guardar', () => {
    cy.intercept('POST', '**/api/ordenes_de_servicio/crear').as('crear');
    cy.contains('.rs-modal button', 'Cancelar').click();
    cy.get('.rs-modal').should('not.exist');
    cy.get('@crear.all').should('have.length', 0);
  });
});

describe('RF-006.1-04 - Sin técnicos disponibles', () => {
  it('Muestra el aviso y no deja asignar técnico', () => {
    cy.intercept('GET', '**/api/pre_revision/listar**', {
      body: [{ id_pre_revision: 1, fecha_pre_revision: '2026-11-05', estado: 'COMPLETADA', resultado: 'Requiere reparación', id_orden_generada: null, cliente: 'Ana Ruiz', tecnico: 'X', placa: 'ABC 12D' }],
    });
    cy.intercept('GET', '**/api/ordenes_de_servicio/tecnicos-disponibles', { body: [] });
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Administrador', '/panel/pre-revision');
    cy.contains('button', 'Crear orden').click();
    cy.contains('No hay técnicos disponibles actualmente.').should('be.visible');
  });
});