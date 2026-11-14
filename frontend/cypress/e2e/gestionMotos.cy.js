// cypress/e2e/09-motos-modelos.cy.js
import { MOTOS, MODELOS } from '../support/datos';

describe('RF-005 - Motocicletas (UI con escrituras simuladas)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/motocicleta/listar', { body: { status: 'success', data: MOTOS } }).as('listar');
    cy.intercept('GET', '**/api/modelo/listar', { body: { status: 'success', data: MODELOS } });
    cy.intercept('GET', '**/api/motocicleta/sin-moto', { body: { status: 'success', data: [{ id_usuario: 7, nombre: 'Ana', apellido: 'Ruiz' }] } });
    cy.intercept('GET', '**/api/usuarios/listar', { body: [{ id_usuario: 7, nombre: 'Ana', apellido: 'Ruiz' }, { id_usuario: 8, nombre: 'Luis', apellido: 'Mora' }] });
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Administrador', '/panel/moto');
    cy.wait('@listar');
  });

  const abrirNueva = () => {
    cy.contains('button', 'Registrar Motocicleta').click();
    cy.get('.rs-modal').should('be.visible');
    cy.get('select[name="id_modelo"] option').should('have.length.gte', 2);
  };

  it('CP-RF005.2-01: Consulta del listado completo de motocicletas', () => {
    cy.get('table.rs-table tbody tr').should('have.length', 2);
    cy.contains('tr', 'ABC 12D').should('contain', 'Ana Ruiz').and('contain', 'DUKE 200').and('contain', 'Activa');
    cy.contains('tr', 'ABC 12D').invoke('text').should('match', /2[.,]000 KM/);
  });

  it('CP-RF005.2-02: Búsqueda por placa existente', () => {
    cy.get('.rs-search-input').type('abc');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'ABC 12D');
  });

  it('CP-RF005.2-03: Búsqueda por placa inexistente', () => {
    cy.get('.rs-search-input').type('QQQ');
    cy.contains('No hay motocicletas registradas o coincidentes con la búsqueda.').should('be.visible');
  });

  it('CP-RF005.2-04: Filtro por cliente', () => {
    cy.get('.rs-search-input').type('Luis');
    cy.get('table.rs-table tbody tr').should('have.length', 1).and('contain', 'XYZ 98K');
  });

  it('CP-RF005.2-06: Combinación de filtros por texto y modelo', () => {
    cy.get('.rs-search-input').type('Ana');
    cy.get('select.rs-input-white').select('NKD 125');
    cy.contains('No hay motocicletas registradas o coincidentes con la búsqueda.').should('be.visible');
  });

  it('CP-RF005.2-07: Técnico y Cliente no acceden al módulo de motocicletas', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.entrar(rol, '/panel/moto');
      cy.location('pathname').should('not.eq', '/panel/moto');
    });
  });

  it('CP-RF005.1-01: Registro exitoso con todos los campos válidos', () => {
    cy.intercept('GET', '**/api/motocicleta/placa/**', { statusCode: 404, body: { message: 'No encontrada' } });
    cy.intercept('POST', '**/api/motocicleta/crear', { statusCode: 201, body: { status: 'success', message: 'Motocicleta registrada exitosamente.' } }).as('crear');
    abrirNueva();
    cy.get('input[name="placa"]').type('abc12d').should('have.value', 'ABC 12D').blur();
    cy.get('select[name="id_modelo"]').select('DUKE 200');
    cy.get('input[name="kilometraje_actual"]').type('2000').invoke('val').should('match', /2[.,]000/);
    cy.get('select[name="id_usuario"]').select('Ana Ruiz');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.wait('@crear').its('request.body').should((b) => {
      expect(b.placa).to.eq('ABC 12D');
      expect(b.id_modelo).to.eq(1);
      expect(b.id_usuario).to.eq(7);
      expect(b.kilometraje_actual).to.eq(2000);
    });
    cy.get('@alerta').should('have.been.calledWith', 'Motocicleta registrada con éxito');
  });

  it('CP-RF005.1-02: Placa duplicada', () => {
    cy.intercept('GET', '**/api/motocicleta/placa/**', {
      body: { status: 'success', data: { id_moto: 1, placa: 'ABC 12D', id_modelo: 1, id_usuario: 7, kilometraje_actual: 1500 } },
    });
    cy.intercept('POST', '**/api/motocicleta/crear').as('crear');
    abrirNueva();
    cy.get('input[name="placa"]').type('ABC12D').blur();
    cy.contains('Placa ya registrada (datos precargados)').should('be.visible');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('La motocicleta con esta placa ya se encuentra registrada.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF005.1-03: Campos obligatorios vacíos', () => {
    cy.intercept('POST', '**/api/motocicleta/crear').as('crear');
    abrirNueva();
    cy.contains('.rs-btn-primary', 'Guardar').click();
    ['La placa es obligatoria', 'Seleccione un modelo válido', 'El kilometraje es obligatorio', 'Seleccione el cliente / dueño de la motocicleta'].forEach((m) =>
      cy.contains(m).should('be.visible')
    );
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF005.1-04: Modelo inexistente es rechazado por el backend', () => {
    cy.intercept('GET', '**/api/motocicleta/placa/**', { statusCode: 404, body: {} });
    cy.intercept('POST', '**/api/motocicleta/crear', { statusCode: 400, body: { status: 'error', message: 'Lo sentimos, no se ha podido registrar la motocicleta. Inténtelo nuevamente' } });
    abrirNueva();
    cy.get('input[name="placa"]').type('ABC12D').blur();
    cy.get('select[name="id_modelo"]').select('DUKE 200');
    cy.get('input[name="kilometraje_actual"]').type('100');
    cy.get('select[name="id_usuario"]').select('Ana Ruiz');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.get('@alerta').should('have.been.calledWith', 'Lo sentimos, no se ha podido registrar la motocicleta. Inténtelo nuevamente');
  });

  it('CP-RF005.1-05: Kilometraje en cero o negativo es rechazado', () => {
    cy.intercept('POST', '**/api/motocicleta/crear').as('crear');
    abrirNueva();
    cy.get('input[name="placa"]').type('ABC12D');
    cy.get('select[name="id_modelo"]').select('DUKE 200');
    cy.get('select[name="id_usuario"]').select('Ana Ruiz');
    cy.get('input[name="kilometraje_actual"]').type('0');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('El kilometraje debe ser mayor a 0 KM').should('be.visible');
    cy.get('input[name="kilometraje_actual"]').clear().type('-5').invoke('val').should('not.include', '-');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF005.1-08: Placa con formato inválido (máx. 6 caracteres: 3 letras, 2 números, 1 letra)', () => {
    cy.intercept('POST', '**/api/motocicleta/crear').as('crear');
    abrirNueva();
    cy.get('input[name="placa"]').type('ABC123DEF').invoke('val').should('have.length', 7);
    cy.get('input[name="placa"]').clear().type('ABC123');
    cy.get('select[name="id_modelo"]').select('DUKE 200');
    cy.get('input[name="kilometraje_actual"]').type('100');
    cy.get('select[name="id_usuario"]').select('Ana Ruiz');
    cy.contains('.rs-btn-primary', 'Guardar').click();
    cy.contains('Formato inválido. Debe terminar en letra (Ej. WUS 28U)').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF005.3-01 / 02: Actualización de modelo y kilometraje; placa no editable', () => {
    cy.intercept('PUT', '**/api/motocicleta/modificar/1', { statusCode: 200, body: { status: 'success', message: 'Motocicleta actualizada exitosamente.' } }).as('modificar');
    cy.contains('tr', 'ABC 12D').find('.rs-btn-edit').click();
    cy.get('input[name="placa"]').should('be.disabled').and('have.value', 'ABC 12D');
    cy.get('select[name="id_modelo"]').select('NKD 125');
    cy.get('input[name="kilometraje_actual"]').clear().type('2500');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.wait('@modificar').its('request.body').should((b) => {
      expect(b.id_modelo).to.eq(2);
      expect(b.kilometraje_actual).to.eq(2500);
    });
    cy.get('@alerta').should('have.been.calledWith', 'Motocicleta actualizada con éxito');
  });

  it('CP-RF005.3-04: Kilometraje en cero al actualizar es rechazado', () => {
    cy.intercept('PUT', '**/api/motocicleta/modificar/**').as('modificar');
    cy.contains('tr', 'ABC 12D').find('.rs-btn-edit').click();
    cy.get('input[name="kilometraje_actual"]').clear().type('0');
    cy.contains('.rs-btn-primary', 'Actualizar').click();
    cy.contains('El kilometraje debe ser mayor a 0 KM').should('be.visible');
    cy.get('@modificar.all').should('have.length', 0);
  });

  it('CP-RF005.4-01: Desactivación manual con confirmación', () => {
    cy.intercept('PUT', '**/api/motocicleta/estado/1', { statusCode: 200, body: { status: 'success' } }).as('estado');
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('tr', 'ABC 12D').find('.rs-btn-delete').click();
    cy.wait('@estado').its('request.body.estado').should('eq', 0);
    cy.get('@alerta').should('have.been.calledWith', 'Motocicleta desactivada con éxito');
  });

  it('CP-RF005.4-02: Cancelar la desactivación no cambia el estado', () => {
    cy.intercept('PUT', '**/api/motocicleta/estado/**').as('estado');
    cy.on('window:confirm', () => false);
    cy.contains('tr', 'ABC 12D').find('.rs-btn-delete').click();
    cy.get('@estado.all').should('have.length', 0);
  });

  it('CP-RF005.4-05: Reactivación manual de moto desactivada', () => {
    cy.intercept('PUT', '**/api/motocicleta/estado/2', { statusCode: 200, body: { status: 'success' } }).as('estado');
    cy.contains('tr', 'XYZ 98K').should('contain', 'Inactiva').find('.rs-status-badge').click();
    cy.wait('@estado').its('request.body.estado').should('eq', 1);
  });

  it('CP-RF005.4-07: Moto con orden activa no se desactiva', () => {
    const msg = 'Primero debe cancelar la orden #000 para desactivar la moto';
    cy.intercept('PUT', '**/api/motocicleta/estado/1', { statusCode: 400, body: { status: 'error', message: msg } });
    const alerta = cy.stub().as('alerta');
    cy.on('window:alert', alerta);
    cy.contains('tr', 'ABC 12D').find('.rs-btn-delete').click();
    cy.get('@alerta').should('have.been.calledWith', msg);
  });
});

describe('RF-008 - Modelos de motocicleta (UI con escrituras simuladas)', () => {
  beforeEach(() => {
    cy.intercept('GET', '**/api/motocicleta/listar', { body: { status: 'success', data: MOTOS } });
    cy.intercept('GET', '**/api/modelo/listar', { body: { status: 'success', data: MODELOS } }).as('modelos');
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Administrador', '/panel/moto');
    cy.contains('button', 'Gestionar modelos').click();
    cy.wait('@modelos');
  });

  it('CP-RF008.2-01 / 02 / 03: Listado, búsqueda con y sin resultados', () => {
    cy.get('.rs-modal table tbody tr').should('have.length', 2);
    cy.get('.rs-modal .rs-search-input').type('duke');
    cy.get('.rs-modal table tbody tr').should('have.length', 1).and('contain', 'DUKE 200');
    cy.get('.rs-modal .rs-search-input').clear().type('zzz');
    cy.contains('No se encontraron modelos.').should('be.visible');
  });

  it('CP-RF008.1-01: Registro exitoso de modelo', () => {
    cy.intercept('POST', '**/api/modelo/crear', { statusCode: 201, body: { status: 'success', message: 'Modelo registrado correctamente.' } }).as('crear');
    cy.contains('button', 'Nuevo modelo').click();
    cy.get('#modelo-nombre').type('PULSAR NS 200');
    cy.contains('button', 'Guardar').click();
    cy.wait('@crear').its('request.body.nombre').should('eq', 'PULSAR NS 200');
    cy.contains('Modelo de motocicleta registrado exitosamente.').should('be.visible');
  });

  it('CP-RF008.1-02: Nombre de modelo duplicado', () => {
    cy.intercept('POST', '**/api/modelo/crear', { statusCode: 409, body: { status: 'error', message: 'El modelo "DUKE 200" ya existe.' } });
    cy.contains('button', 'Nuevo modelo').click();
    cy.get('#modelo-nombre').type('DUKE 200');
    cy.contains('button', 'Guardar').click();
    cy.contains('El modelo "DUKE 200" ya existe.').should('be.visible');
  });

  it('CP-RF008.1-03: Campo obligatorio vacío', () => {
    cy.intercept('POST', '**/api/modelo/crear').as('crear');
    cy.contains('button', 'Nuevo modelo').click();
    cy.contains('button', 'Guardar').click();
    cy.contains('El nombre del modelo es obligatorio.').should('be.visible');
    cy.get('@crear.all').should('have.length', 0);
  });

  it('CP-RF008.1-05: Los modelos nuevos se muestran con estado Activo', () => {
    cy.contains('.rs-modal tr', 'DUKE 200').should('contain', 'Activo');
    cy.contains('.rs-modal tr', 'NKD 125').should('contain', 'Inactivo');
  });

  it('CP-RF008.3-01: Actualización exitosa de modelo', () => {
    cy.intercept('PUT', '**/api/modelo/modificar/1', { statusCode: 200, body: { status: 'success', message: 'Modelo actualizado correctamente.' } }).as('modificar');
    cy.contains('.rs-modal tr', 'DUKE 200').find('.rs-btn-edit').click();
    cy.get('#modelo-nombre').should('have.value', 'DUKE 200').clear().type('DUKE 250');
    cy.contains('button', 'Actualizar').click();
    cy.wait('@modificar').its('request.body.nombre').should('eq', 'DUKE 250');
    cy.contains('Modelo de motocicleta actualizado satisfactoriamente.').should('be.visible');
  });

  it('CP-RF008.3-03: Campo obligatorio vacío al actualizar', () => {
    cy.intercept('PUT', '**/api/modelo/modificar/**').as('modificar');
    cy.contains('.rs-modal tr', 'DUKE 200').find('.rs-btn-edit').click();
    cy.get('#modelo-nombre').clear();
    cy.contains('button', 'Actualizar').click();
    cy.contains('El nombre del modelo es obligatorio.').should('be.visible');
    cy.get('@modificar.all').should('have.length', 0);
  });

  it('CP-RF008.3-04: Nombre duplicado al actualizar', () => {
    cy.intercept('PUT', '**/api/modelo/modificar/1', { statusCode: 409, body: { status: 'error', message: 'Ya existe un modelo denominado "NKD 125" para esta marca.' } });
    cy.contains('.rs-modal tr', 'DUKE 200').find('.rs-btn-edit').click();
    cy.get('#modelo-nombre').clear().type('NKD 125');
    cy.contains('button', 'Actualizar').click();
    cy.contains('Ya existe un modelo denominado "NKD 125" para esta marca.').should('be.visible');
  });

  it('CP-RF008.4-01: Desactivación exitosa de un modelo sin motocicletas', () => {
    cy.intercept('PATCH', '**/api/modelo/desactivar/1', { statusCode: 200, body: { status: 'success', message: 'Modelo eliminado correctamente.' } }).as('desactivar');
    cy.on('window:confirm', () => true);
    cy.contains('.rs-modal tr', 'DUKE 200').find('.rs-btn-delete').click();
    cy.wait('@desactivar');
    cy.contains('Modelo de motocicleta desactivado satisfactoriamente.').should('be.visible');
  });

  it('CP-RF008.4-03: Modelo asociado a motocicletas activas no se desactiva', () => {
    cy.intercept('PATCH', '**/api/modelo/desactivar/1', { statusCode: 400, body: { status: 'error', message: 'No se puede eliminar el modelo. Está asociado a 1 motocicleta(s).' } });
    cy.on('window:confirm', () => true);
    cy.contains('.rs-modal tr', 'DUKE 200').find('.rs-btn-delete').click();
    cy.contains('No se puede eliminar el modelo. Está asociado a 1 motocicleta(s).').should('be.visible');
  });

  it('CP-RF008.4-04: Modelo inactivo ofrece reactivar, no desactivar', () => {
    cy.contains('.rs-modal tr', 'NKD 125').within(() => {
      cy.get('.rs-btn-delete').should('not.exist');
      cy.get('.rs-btn-reactivate').should('exist');
    });
  });
})

describe('RF-005 - API de motocicletas (rechazos y permisos reales, sin escrituras)', () => {
  const M = '/api/motocicleta';
  const VALIDA = { placa: 'QZX 00Q', id_modelo: 1, id_usuario: 1, kilometraje_actual: 100 };

  it('CP-RF005.2-01 / 07: Solo el Administrador lista motocicletas', () => {
    cy.peticion('GET', `${M}/listar`, 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.status).to.eq('success');
      expect(r.body.data).to.be.an('array');
    });
    ['Técnico', 'Cliente'].forEach((rol) => cy.peticion('GET', `${M}/listar`, rol).its('status').should('eq', 403));
  });

  it('CP-RF005.2-02 / 03: Consulta por placa existente, inexistente e inválida', function () {
    cy.peticion('GET', `${M}/consultar/placa/${encodeURIComponent('ZZZ 99Z')}`, 'Administrador').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('No se encontró motocicleta registrada con esa placa.');
    });
    cy.peticion('GET', `${M}/consultar/placa/123`, 'Administrador').then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('Formato de placa inválido.');
    });
    cy.peticion('GET', `${M}/listar`, 'Administrador').then((l) => {
      if (!l.body.data.length) return this.skip();
      cy.peticion('GET', `${M}/consultar/placa/${encodeURIComponent(l.body.data[0].placa)}`, 'Administrador').then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.data.placa).to.eq(l.body.data[0].placa);
      });
    });
  });

  it('CP-RF005.1-02: Placa duplicada (409)', function () {
    cy.peticion('GET', `${M}/listar`, 'Administrador').then((l) => {
      if (!l.body.data.length) return this.skip();
      cy.peticion('POST', `${M}/crear`, 'Administrador', { ...VALIDA, placa: l.body.data[0].placa }).then((r) => {
        expect(r.status).to.eq(409);
        expect(r.body.message).to.include('ya se encuentra registrada');
      });
    });
  });

  it('CP-RF005.1-08: Formato de placa inválido (400)', () => {
    ['123', 'ABCDEFG', 'AB 12D'].forEach((placa) =>
      cy.peticion('POST', `${M}/crear`, 'Administrador', { ...VALIDA, placa }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.include('Formato de placa inválido');
      })
    );
  });

  it('CP-RF005.1-05: Kilometraje negativo, cero o excesivo (400)', () => {
    [-5, 0, 2000000].forEach((km) =>
      cy.peticion('POST', `${M}/crear`, 'Administrador', { ...VALIDA, kilometraje_actual: km }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.include('El kilometraje debe ser mayor a 0 KM');
      })
    );
  });

  it('CP-RF005.1-07 / 005.3-07 / 005.4-08: Sin rol Administrador no registra, actualiza ni cambia estado (403)', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.peticion('POST', `${M}/crear`, rol, VALIDA).its('status').should('eq', 403);
      cy.peticion('PUT', `${M}/modificar/1`, rol, { kilometraje_actual: 100 }).its('status').should('eq', 403);
      cy.peticion('PUT', `${M}/estado/1`, rol, { estado: 0 }).its('status').should('eq', 403);
    });
  });

  it('CP-RF005.3-03: Actualizar o cambiar estado de moto inexistente (404)', () => {
    cy.peticion('PUT', `${M}/modificar/999999`, 'Administrador', { kilometraje_actual: 100 }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('La motocicleta especificada no existe.');
    });
    cy.peticion('PUT', `${M}/estado/999999`, 'Administrador', { estado: 0 }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('Motocicleta no encontrada.');
    });
  });

  it('CP-RF005.3-04 / 05: Kilometraje inválido o menor al actual al actualizar (400)', function () {
    cy.peticion('GET', `${M}/listar`, 'Administrador').then((l) => {
      const moto = l.body.data.find((m) => Number(m.kilometraje_actual) > 1);
      if (!moto) return this.skip();
      const id = moto.id_moto;
      [0, -10].forEach((km) =>
        cy.peticion('PUT', `${M}/modificar/${id}`, 'Administrador', { kilometraje_actual: km }).then((r) => {
          expect(r.status).to.eq(400);
          expect(r.body.message).to.eq('El kilometraje debe ser mayor a 0 KM.');
        })
      );
      cy.peticion('PUT', `${M}/modificar/${id}`, 'Administrador', { kilometraje_actual: Number(moto.kilometraje_actual) - 1 }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.include('no puede ser inferior al último registrado');
      });
      cy.peticion('PUT', `${M}/modificar/${id}`, 'Administrador', { kilometraje_actual: Number(moto.kilometraje_actual) + 40000 }).then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.include('error de digitación');
      });
    });
  });

  it('CP-RF005.5-03: Motos de un cliente inexistente (404)', () => {
    cy.peticion('GET', `${M}/por-usuario/999999`, 'Administrador').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('No se encontraron motocicletas para este usuario.');
    });
    cy.peticion('GET', `${M}/por-usuario/1`, 'Cliente').its('status').should('eq', 403);
  });
});

describe('RF-008 - API de modelos (rechazos y permisos reales, sin escrituras)', () => {
  const MO = '/api/modelo';

  it('CP-RF008.2-01 / 04 / 06: Administrador, Técnico y Cliente consultan modelos', () => {
    ['Administrador', 'Técnico', 'Cliente'].forEach((rol) =>
      cy.peticion('GET', `${MO}/listar`, rol).then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.data).to.be.an('array');
      })
    );
    cy.peticion('GET', `${MO}/listar`).its('status').should('eq', 401);
  });

  it('CP-RF008.1-03: Nombre vacío o inválido (400)', () => {
    cy.peticion('POST', `${MO}/crear`, 'Administrador', { nombre: '   ' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre del modelo es obligatorio.');
    });
    cy.peticion('POST', `${MO}/crear`, 'Administrador', { nombre: '123' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre debe iniciar con letras (ej. DUKE 200).');
    });
    cy.peticion('POST', `${MO}/crear`, 'Administrador', { nombre: 'A'.repeat(51) }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El nombre debe tener entre 2 y 50 caracteres.');
    });
  });

  it('CP-RF008.1-02: Nombre de modelo duplicado (409)', function () {
    cy.peticion('GET', `${MO}/listar`, 'Administrador').then((l) => {
      const m = l.body.data.find((x) => /^[A-ZÁÉÍÓÚÑ]/i.test(x.nombre) && x.nombre.length <= 50);
      if (!m) return this.skip();
      cy.peticion('POST', `${MO}/crear`, 'Administrador', { nombre: m.nombre }).then((r) => {
        expect(r.status).to.eq(409);
        expect(r.body.message).to.include('ya existe');
      });
    });
  });

  it('CP-RF008.1-04 / 008.3-05 / 008.4-05: Sin rol Administrador no registra, actualiza ni desactiva (403)', () => {
    ['Técnico', 'Cliente'].forEach((rol) => {
      cy.peticion('POST', `${MO}/crear`, rol, { nombre: 'QA MODELO' }).its('status').should('eq', 403);
      cy.peticion('PUT', `${MO}/modificar/1`, rol, { nombre: 'QA MODELO' }).its('status').should('eq', 403);
      cy.peticion('PATCH', `${MO}/desactivar/1`, rol).its('status').should('eq', 403);
    });
  });

  it('CP-RF008.3-02: Actualizar modelo inexistente (404) o con id inválido (400)', () => {
    cy.peticion('PUT', `${MO}/modificar/999999`, 'Administrador', { nombre: 'QA MODELO' }).then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('El modelo no existe.');
    });
    cy.peticion('PUT', `${MO}/modificar/abc`, 'Administrador', { nombre: 'QA MODELO' }).then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El ID del modelo no es válido.');
    });
  });

  it('CP-RF008.4-02: Desactivar modelo inexistente (404) o con id inválido (400)', () => {
    cy.peticion('PATCH', `${MO}/desactivar/999999`, 'Administrador').then((r) => {
      expect(r.status).to.eq(404);
      expect(r.body.message).to.eq('El modelo no existe.');
    });
    cy.peticion('PATCH', `${MO}/desactivar/abc`, 'Administrador').then((r) => {
      expect(r.status).to.eq(400);
      expect(r.body.message).to.eq('El ID proporcionado no es válido.');
    });
  });

  it('CP-RF008.4-03: Modelo asociado a motocicletas no se desactiva (400)', function () {
    cy.peticion('GET', `${MO}/listar`, 'Administrador').then((l) => {
      const m = l.body.data.find((x) => Number(x.total_motos) > 0);
      if (!m) return this.skip();
      cy.peticion('PATCH', `${MO}/desactivar/${m.id_modelo}`, 'Administrador').then((r) => {
        expect(r.status).to.eq(400);
        expect(r.body.message).to.include('No se puede eliminar el modelo');
      });
    });
  });

  it('CP-RF008.2: Consultar modelo inexistente (404), inválido (400) y existente (200)', function () {
    cy.peticion('GET', `${MO}/consultar/999999`, 'Administrador').its('status').should('eq', 404);
    cy.peticion('GET', `${MO}/consultar/abc`, 'Administrador').its('status').should('eq', 400);
    cy.peticion('GET', `${MO}/listar`, 'Administrador').then((l) => {
      if (!l.body.data.length) return this.skip();
      cy.peticion('GET', `${MO}/consultar/${l.body.data[0].id_modelo}`, 'Administrador').then((r) => {
        expect(r.status).to.eq(200);
        expect(r.body.data.nombre).to.eq(l.body.data[0].nombre);
      });
    });
  });
});