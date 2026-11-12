// frontend/cypress/support/commands.js  (REEMPLAZA TODO EL ARCHIVO)
import { API_URL } from './entorno';

const PERFIL = {
  Administrador: { id: 1, nombre: 'Admin', apellido: 'QA' },
  'Técnico': { id: 900001, nombre: 'Tecnico', apellido: 'QA' },
  Cliente: { id: 900002, nombre: 'Cliente', apellido: 'QA' },
};

Cypress.Commands.add('credenciales', () => cy.task('credenciales'));

Cypress.Commands.add('jwtDe', (rol = 'Administrador', op = {}) => {
  const p = PERFIL[rol] || PERFIL.Administrador;
  return cy.task('firmarJwt', {
    payload: { id: p.id, role: op.role || rol, nombre: p.nombre, apellido: p.apellido },
    secret: op.secret,
    expiresIn: op.expiresIn,
  });
});

Cypress.Commands.add('entrar', (rol = 'Administrador', ruta = '/panel') => {
  cy.jwtDe(rol).then((token) => {
    cy.visit(ruta, {
      onBeforeLoad(win) {
        win.localStorage.setItem('token', token);
        win.localStorage.setItem('rol', rol);
        win.localStorage.setItem('userId', String(PERFIL[rol].id));
      },
    });
  });
});

Cypress.Commands.add('peticion', (metodo, ruta, rol, body) => {
  const enviar = (token) =>
    cy.request({
      method: metodo,
      url: `${API_URL}${ruta}`,
      body,
      failOnStatusCode: false,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
  if (!rol) return enviar();
  if (rol.token) return enviar(rol.token);
  return cy.jwtDe(rol).then(enviar);
});

Cypress.Commands.add('loginApi', (correo, clave) =>
  cy.task('credenciales').then((c) =>
    cy.request({
      method: 'POST',
      url: `${API_URL}/api/auth/login`,
      body: { correo_usuario: correo || c.correo, contrasena: clave || c.clave },
      failOnStatusCode: false,
    })
  )
);

Cypress.Commands.add('elegirTipo', (texto) =>
  cy.get('.rs-modal').find('input[id^="react-select"]').first().type(`${texto}{enter}`, { force: true })
);

Cypress.Commands.add('escribirCorreo', (local) => {
  cy.get('.rs-modal').then(($m) => {
    if ($m.find('input[name="correo_usuario"]').length) {
      cy.get('.rs-modal input[name="correo_usuario"]').first().type(`${local}@gmail.com`);
    } else {
      cy.get('.rs-modal input[placeholder="usuario"]').first().type(local);
    }
  });
});

Cypress.Commands.add('escribirToken', (codigo) => {
  cy.contains('label', 'Código de Activación').parent().find('input').then(($i) => {
    if ($i.length > 1) [...codigo].forEach((d, i) => cy.wrap($i[i]).type(d));
    else cy.wrap($i).type(codigo);
  });
});

// Los intercepts ignoran el query string (?_t=...) que agrega el frontend
const METODOS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const conQuery = (u) =>
  typeof u === 'string' && u.startsWith('**') && !u.includes('?') && !u.endsWith('*') ? `${u}*` : u;

Cypress.Commands.overwrite('intercept', (original, ...args) => {
  if (METODOS.includes(args[0]) && typeof args[1] === 'string') args[1] = conQuery(args[1]);
  else args[0] = conQuery(args[0]);
  return original(...args);
});