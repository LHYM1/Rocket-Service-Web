describe('Prueba E2E de Autenticación - Sistema de gestión de órdenes', () => {
  it('Debe iniciar sesión correctamente y llegar al dashboard (rol administrador)', () => {
    
    cy.visit('http://localhost:3000/');


    // Ingresar las credenciales de prueba (correo y contraseña existentes)
    cy.get("input[name='usuario']").type('kevin@gmail.com');
    cy.get("input[name='contrasena']").type('12345678');
    cy.get('.login-btn').click();

    // 6. Validar la redirección exitosa (puede ser el home o directo al catálogo)
    cy.url().should('include', '/panel');

    // Mensaje de éxito en la consola de Cypress
    cy.log('Prueba de E2E ejecutada exitosamente');
  });
});
