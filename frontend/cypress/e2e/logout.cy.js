describe('RF-002 - Cerrar sesión', () => {

  beforeEach(() => {
    // Login real vía UI antes de cada prueba (usuario Administrador de prueba)
    cy.visit('http://localhost:3000/');
    cy.get('input[name="usuario"]').type('kevin@gmail.com');
    cy.get('input[name="contrasena"]').type('12345678');
    cy.get('button.login-btn').click();
    cy.url({ timeout: 8000 }).should('include', '/panel/dashboard');
  });

  it('CP-RF002-01: Validar el cierre de sesión exitoso desde la interfaz', () => {
    cy.get('button.btn-cerrar-sesion').click();
    cy.url({ timeout: 8000 }).should('eq', 'http://localhost:3000/');
  });

  it('CP-RF002-02: Validar la eliminación del JWT y los datos de sesión en localStorage', () => {
    cy.get('button.btn-cerrar-sesion').click();
    cy.url({ timeout: 8000 }).should('eq', 'http://localhost:3000/');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
      expect(win.localStorage.getItem('rol')).to.be.null;
      expect(win.localStorage.getItem('userId')).to.be.null;
    });
  });

  it('CP-RF002-03: Validar la redirección a la página de inicio de sesión', () => {
    cy.get('button.btn-cerrar-sesion').click();
    cy.url({ timeout: 8000 }).should('eq', 'http://localhost:3000/');
    cy.get('input[name="usuario"]').should('be.visible');
  });

  it('CP-RF002-04: Validar que no sea posible acceder a rutas protegidas después de cerrar sesión', () => {
    cy.get('button.btn-cerrar-sesion').click();
    cy.url({ timeout: 8000 }).should('eq', 'http://localhost:3000/');

    // Intento de acceso directo a una ruta protegida tras el logout
    cy.visit('http://localhost:3000/panel/dashboard');
    cy.url({ timeout: 8000 }).should('eq', 'http://localhost:3000/');
  });

  it('CP-RF002-05: Validar el comportamiento si el JWT ya no existe al intentar cerrar sesión', () => {
    // Simula datos de sesión incompletos (FA-001): se borra el token manualmente
    cy.window().then((win) => {
      win.localStorage.removeItem('token');
    });

    cy.get('button.btn-cerrar-sesion').click();
    cy.url({ timeout: 8000 }).should('eq', 'http://localhost:3000/');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('rol')).to.be.null;
      expect(win.localStorage.getItem('userId')).to.be.null;
    });
  });

});