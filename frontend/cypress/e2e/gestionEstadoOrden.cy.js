describe('Módulo de Administración - Gestión de Motos (CRUD)', () => {

  beforeEach(() => {
    // Intercepción de rutas API para la gestión de motos
    cy.intercept('GET', '**/api/estado_de_orden_de_servicio/listar*').as('listarEstdOrden');
    cy.intercept('POST', '**/api/estado_de_orden_de_servicio/crear*').as('crearEstdOrden');
    cy.intercept('PUT', '**/api/estado_de_orden_de_servicio/modificar*').as('actualizarEstOrden');
    cy.intercept('PUT', '**/api/estado_de_orden_de_servicio/eliminarEstdOrd/*').as('eliminarEstdOrd');

    
    /** Quedé acá */
    // 1. Inyección de token de sesión en localStorage para evitar redirección por Auth
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'TU_TOKEN_JWT_AQUI');
      win.localStorage.setItem('rol', 'Administrador');
      win.localStorage.setItem('userId', '1');
    });

    // 2. Visitar la pantalla de gestión de motos dentro del panel
    cy.visit('/panel/moto');
  });

  
  // 1. Lectura y listado de motocicletas
  it('CP-MOT-001: Debe cargar y listar correctamente las motocicletas registradas', () => {
    cy.wait('@getMotos');

    // Validar visualización de la tabla y contenido mínimo
    cy.get('table').should('be.visible');
    cy.get('table thead tr th').should('have.length.at.least', 4);
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });


  // 2. Registro o creación de motocicleta
  it('CP-MOT-002: Debe registrar una nueva motocicleta asignada a un cliente', () => {
    const placaTest = `TEST${Math.floor(100 + Math.random() * 900)}`;

    // Abrir Modal de registro
    cy.get('button').contains(/Registrar Motocicleta/i).click();

    // Seleccionar Cliente o propietario de la motocicleta 
    cy.get('body').within(() => {
      cy.contains('label', /Cliente|Propietario|Usuario/i).parent().click({ force: true });
    });
    cy.get('div, option').contains(/Carlos|Juan|Cliente/i).first().click({ force: true });

    // Llenar campos requeridos de la motocicleta
    cy.get('input[name="placa"]').type(placaTest);
    cy.get('input[name="marca"]').type('Yamaha');
    cy.get('input[name="modelo"]').type('FZ 250');
    cy.get('input[name="anio"], input[name="modelo_anio"]').type('2024');
    cy.get('input[name="cilindraje"]').type('250');

    // Guardar registro
    cy.get('button').contains(/Guardar|Registrar|Crear/i).click();

    // Validación de respuesta HTTP del servidor
    cy.wait('@crearMoto').its('response.statusCode').should('be.oneOf', [200, 201]);
  });

  
  // 3. Edición de motocicleta
  it('CP-MOT-003: Debe permitir actualizar los datos de una motocicleta existente', () => {
    cy.wait('@getMotos');

    // Seleccionar el botón de edición de la primera fila
    cy.get('table tbody tr').first().within(() => {
      cy.get('button, a, i').filter('.fa-edit, .fa-pen, :contains("Editar")').first().click({ force: true });
    });

    // Actualizar campos como cilindraje o modelo
    cy.get('input[name="modelo"]').clear().type('FZ 250 ABS');
    cy.get('input[name="cilindraje"]').clear().type('249');

    // Guardar cambios
    cy.get('button').contains(/Guardar|Actualizar/i).click();

    // Verificar respuesta del backend
    cy.wait('@actualizarMoto').its('response.statusCode').should('eq', 200);
  });


  // 4. Borrado lógico o desactivación de motocicleta
  it('CP-MOT-004: Debe desactivar o eliminar una motocicleta previa confirmación', () => {
    cy.wait('@getMotos');

    // Aceptar el cuadro de diálogo modal  (alert nativo del navegador)
    cy.on('window:confirm', () => true);

    // Clic en el botón de eliminar/desactivar de la primera fila
    cy.get('table tbody tr').first().within(() => {
      cy.get('button, i').filter('.fa-trash, .fa-trash-alt, .fa-ban, :contains("Eliminar")').first().click({ force: true });
    });

    // Validar respuesta exitosa del servidor
    cy.wait('@desactivarMoto').its('response.statusCode').should('eq', 200);
  });

});