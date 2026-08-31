describe('RF-001 - Iniciar sesión', () => {

  beforeEach(() => {
    cy.visit('http://localhost:3000/');
  });

  it('CP-RF001-01: Inicio de sesión exitoso con correo y contraseña válidos', () => {
    cy.get('input[name="usuario"]').type('kevin@gmail.com');
    cy.get('input[name="contrasena"]').type('12345678');
    cy.get('button.login-btn').click();
    
    // El login hace un setTimeout de 1.5s antes de redirigir, damos margen
    cy.url({ timeout: 8000 }).should('include', '/panel/dashboard');
    
    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.not.be.null;
      expect(win.localStorage.getItem('rol')).to.eq('Administrador');
      expect(win.localStorage.getItem('userId')).to.not.be.null;
    });
    cy.get('#root button.menu-toggle').click();
    cy.get('#root button.menu-toggle').click();
    cy.get('#root button.menu-toggle').click();
  });

  it('CP-RF001-02: Intento de inicio de sesión con correo no registrado', () => {
    cy.get('input[name="usuario"]').type('correo_no_existe_9999@gmail.com');
    cy.get('input[name="contrasena"]').type('cualquierClave123');
    cy.get('button.login-btn').click();

    // El sistema limpia el campo contraseña y no navega fuera del login
    cy.get('input[name="contrasena"]', { timeout: 6000 }).should('have.value', '');
    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });

  it('CP-RF001-03: Intento de inicio de sesión con contraseña incorrecta', () => {
    cy.get('input[name="usuario"]').type('kevin@gmail.com');
    cy.get('input[name="contrasena"]').type('contrasenaIncorrecta1');
    cy.get('button.login-btn').click();

    cy.get('input[name="contrasena"]', { timeout: 6000 }).should('have.value', '');
    cy.url().should('eq', 'http://localhost:3000/');

    cy.window().then((win) => {
      expect(win.localStorage.getItem('token')).to.be.null;
    });
  });

});