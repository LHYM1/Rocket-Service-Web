describe('Módulo de Administración - Gestión de Usuarios (CRUD e Invitaciones)', () => {

  beforeEach(() => {
    // Intercepción de las rutas API
    cy.intercept('GET', '**/api/usuarios/listar').as('getUsuarios');
    cy.intercept('GET', '**/api/clasificacion_de_usuarios/listar').as('getCategorias');
    cy.intercept('GET', '**/api/usuarios/verificar-correo*').as('verificarCorreo');

    // Inyección de token de sesión en localStorage
    cy.window().then((win) => {
      win.localStorage.setItem('token', 'TU_TOKEN_JWT_AQUI');
      win.localStorage.setItem('rol', 'Administrador');
      win.localStorage.setItem('userId', '1');
    });

    cy.visit('/panel/users');
  });


  // 1. Listado de usuarios

  it('CP-ADM-001: Debe listar correctamente los usuarios registrados y la estructura de la tabla', () => {
    cy.wait('@getUsuarios');
    
    // Verificar que la tabla existe y tiene contenido
    cy.get('table').should('be.visible');
    cy.get('table thead tr th').should('have.length.at.least', 5);
    cy.get('table tbody tr').should('have.length.at.least', 1);
  });

  
  // 2. Creación de cliente e invitación de técnico
  context('Creación e Invitación de Usuarios (Modal)', () => {

    it('CP-ADM-002: Debe permitir registrar e invitar un nuevo Cliente', () => {
      cy.intercept('POST', '**/api/usuarios/invitar-cliente').as('crearCliente');

      // Abrir Modal
      cy.get('button').contains(/Nuevo|Registrar|Agregar/i).click();

      // Seleccionar Tipo de Usuario utilizando búsquedas por contenedor visible
      cy.get('body').within(() => {
        cy.contains('label', /Tipo|Rol|Categoría/i).parent().click();
      });
      cy.contains('div', 'Cliente').click();

      // Formulario
      cy.get('input[name="nombre"]').type('Carlos');
      cy.get('input[name="apellido"]').type('Gomez');
      cy.get('input[name="correo_usuario"]').type(`cliente_${Date.now()}@test.com`);
      cy.get('input[name="telefono_usuario"]').type('3001234567');

      // Guardar
      cy.get('button').contains(/Guardar|Enviar|Crear/i).click();

      cy.wait('@crearCliente').its('response.statusCode').should('eq', 201);
    });

    it('CP-ADM-003: Debe permitir invitar un nuevo Técnico', () => {
      cy.intercept('POST', '**/api/usuarios/invitar-tecnico').as('invitarTecnico');

      cy.get('button').contains(/Nuevo|Registrar|Agregar/i).click();

      cy.get('body').within(() => {
        cy.contains('label', /Tipo|Rol|Categoría/i).parent().click();
      });
      cy.contains('div', 'Técnico').click();

      cy.get('input[name="correo_usuario"]').type(`tecnico_${Date.now()}@test.com`);

      cy.get('button').contains(/Guardar|Enviar|Crear/i).click();

      cy.wait('@invitarTecnico').its('response.statusCode').should('eq', 201);
    });
  });

  // 3. Edición de usuario 
  it('CP-ADM-004: Debe permitir actualizar la información de un usuario existente', () => {
    cy.intercept('PUT', '**/api/usuarios/modificar/*').as('actualizarUsuario');
    cy.wait('@getUsuarios');

    // Busca botones con iconos o texto de edición dentro de la primera fila
    cy.get('table tbody tr').first().within(() => {
      cy.get('button, a, i').filter('.fa-edit, .fa-pen, :contains("Editar")').first().click({ force: true });
    });

    cy.get('input[name="nombre"]').clear().type('NombreActualizado');
    cy.get('input[name="telefono_usuario"]').clear().type('3119876543');

    cy.get('button').contains(/Guardar|Actualizar/i).click();

    cy.wait('@actualizarUsuario').its('response.statusCode').should('eq', 200);
  });

  
  // 4. Desactivación y reactivación de usuarios
  context('Acciones sobre el estado del Usuario', () => {

    it('CP-ADM-005: Debe desactivar un usuario activo al confirmar la alerta', () => {
      cy.intercept('PUT', '**/api/usuarios/eliminar/*').as('desactivarUsuario');
      cy.wait('@getUsuarios');

      cy.on('window:confirm', () => true);

      cy.get('table tbody tr').contains(/Activo/i).parents('tr').within(() => {
        cy.get('button, i').filter('.fa-trash, .fa-user-slash, :contains("Desactivar")').first().click({ force: true });
      });

      cy.wait('@desactivarUsuario').its('response.statusCode').should('eq', 200);
    });

    it('CP-ADM-006: Debe reactivar un usuario inactivo al confirmar la alerta', () => {
      cy.intercept('PUT', '**/api/usuarios/restaurar/*').as('restaurarUsuario');
      cy.wait('@getUsuarios');

      cy.on('window:confirm', () => true);

      cy.get('table tbody tr').contains(/Inactivo/i).parents('tr').within(() => {
        cy.get('button, i').filter('.fa-undo, .fa-user-check, :contains("Reactivar")').first().click({ force: true });
      });

      cy.wait('@restaurarUsuario').its('response.statusCode').should('eq', 200);
    });

  });

});