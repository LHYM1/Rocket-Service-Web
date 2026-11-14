// cypress/e2e/11-rnf-jwt-seguridad.cy.js
import { decodificarJwt } from '../support/datos';
import { API_URL } from '../support/entorno';

describe('RNF-001 - Seguridad de sesión con JWT (tokens simulados)', () => {
  const ADMIN = '/api/auth/admin-data';
  const TEC = '/api/auth/tec-data';

  it('CP-RNF001-01: Tras iniciar sesión se genera un JWT con usuario y rol', () => {
    cy.loginApi().then((r) => {
      expect(r.status).to.eq(200);
      const p = decodificarJwt(r.body.token);
      expect(p).to.include.keys('id', 'role', 'nombre', 'apellido', 'exp', 'iat');
      expect(p.role).to.eq('Administrador');
      expect(p.exp - p.iat).to.eq(8 * 3600);
      expect(JSON.stringify(p)).to.not.match(/contrasena|password|hash/i);
    });
  });

  it('CP-RNF001-02: Ruta protegida exige token y rol correcto', () => {
    cy.peticion('GET', ADMIN).then((r) => {
      expect(r.status).to.eq(401);
      expect(r.body.message).to.eq('Acceso no autorizado. Token requerido.');
    });
    cy.peticion('GET', ADMIN, 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.body.message).to.eq('Bienvenido administrador');
    });
    ['Técnico', 'Cliente'].forEach((rol) =>
      cy.peticion('GET', ADMIN, rol).then((r) => {
        expect(r.status).to.eq(403);
        expect(r.body.message).to.eq('No tienes permisos para realizar esta acción.');
      })
    );
    cy.peticion('GET', TEC, 'Técnico').its('status').should('eq', 200);
    cy.peticion('GET', TEC, 'Administrador').its('status').should('eq', 200);
    cy.peticion('GET', TEC, 'Cliente').its('status').should('eq', 403);
  });

  it('CP-RNF001-03: Token con firma inválida o expirado es rechazado (401)', () => {
    cy.jwtDe('Administrador', { secret: 'clave_incorrecta_qa' }).then((token) =>
      cy.peticion('GET', ADMIN, { token }).then((r) => {
        expect(r.status).to.eq(401);
        expect(r.body.message).to.eq('Token inválido o expirado.');
      })
    );
    cy.jwtDe('Administrador', { expiresIn: '-10s' }).then((token) =>
      cy.peticion('GET', ADMIN, { token }).then((r) => {
        expect(r.status).to.eq(401);
        expect(r.body.message).to.eq('Token inválido o expirado.');
      })
    );
    cy.peticion('GET', ADMIN, { token: 'esto.no.es.un.jwt' }).its('status').should('eq', 401);
  });

  it('CP-RNF001-04: Token adulterado (rol modificado) es rechazado', () => {
    cy.jwtDe('Cliente').then((token) => {
      const [h, , s] = token.split('.');
      const cuerpo = btoa(JSON.stringify({ id: 1, role: 'Administrador' })).replace(/=/g, '');
      cy.peticion('GET', ADMIN, { token: `${h}.${cuerpo}.${s}` }).its('status').should('eq', 401);
    });
  });

  it('CP-RNF001-05: El rol se normaliza (NFC) al validar el token', () => {
    cy.jwtDe('Técnico', { role: 'Te\u0301cnico' }).then((token) =>
      cy.peticion('GET', TEC, { token }).its('status').should('eq', 200)
    );
  });

  it('CP-RNF001-06: El JWT simulado permite el acceso a la vista de su rol', () => {
    cy.intercept('GET', '**/api/ordenes_de_servicio/**', { body: [] });
    cy.intercept('GET', '**/api/notificaciones/**', { body: [] });
    cy.entrar('Técnico', '/panel/orders');
    cy.location('pathname').should('eq', '/panel/orders');
    cy.window().then((win) => {
      const p = decodificarJwt(win.localStorage.getItem('token'));
      expect(p.role).to.eq('Técnico');
      expect(win.localStorage.getItem('rol')).to.eq('Técnico');
    });
  });

  it('CP-RNF001-07: Un token expirado en el navegador no permite navegar el panel', () => {
    cy.jwtDe('Administrador', { expiresIn: '-10s' }).then((token) => {
      cy.visit('/panel/dashboard', {
        onBeforeLoad(win) {
          win.localStorage.setItem('token', token);
          win.localStorage.setItem('rol', 'Administrador');
          win.localStorage.setItem('userId', '1');
        },
      });
      cy.get('body').should('exist');
      cy.peticion('GET', '/api/ordenes_de_servicio/listar', { token }).its('status').should('eq', 401);
    });
  });
});

describe('RNF-002 - Tiempo de respuesta (verificación rápida; carga completa con JMeter)', () => {
  const LIMITE = 3000;

  it('CP-RNF002-01: Inicio de sesión responde en ≤ 3 s', () => {
    cy.loginApi().then((r) => {
      expect(r.status).to.eq(200);
      expect(r.duration).to.be.lessThan(LIMITE);
    });
  });

  it('CP-RNF002-02: Consulta de órdenes responde en ≤ 3 s', () => {
    cy.peticion('GET', '/api/ordenes_de_servicio/listar', 'Administrador').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.duration).to.be.lessThan(LIMITE);
    });
  });

  it('CP-RNF002-03: Consultas de catálogos responden en ≤ 3 s', () => {
    ['/api/insumos/listar', '/api/tipo_servicio/listar', '/api/unidad_de_medida/listar', '/api/categoria/listar'].forEach((ruta) =>
      cy.peticion('GET', ruta, 'Administrador').then((r) => {
        expect(r.status).to.eq(200);
        expect(r.duration).to.be.lessThan(LIMITE);
      })
    );
  });
});

describe('RNF-003 / RNF-004 - Credenciales y disponibilidad', () => {
  it('CP-RNF003-02: La autenticación funciona con contraseña cifrada y no la expone', () => {
    cy.credenciales().then(({ clave }) =>
      cy.loginApi().then((r) => {
        expect(r.status).to.eq(200);
        expect(JSON.stringify(r.body)).to.not.include(clave);
        expect(r.body.user).to.not.have.property('contrasena');
      })
    );
  });

  it('CP-RNF003-04: Una contraseña distinta (hash no coincide) invalida la autenticación', () => {
    cy.credenciales().then(({ correo }) =>
      cy.loginApi(correo, '$2b$12$hashfalsohashfalsohashfalsohashfalsohashfalsohashfalsoh').its('status').should('eq', 401)
    );
  });

  it('CP-RNF004-01: El sistema responde a una solicitud de monitoreo (ping)', () => {
    cy.peticion('GET', '/api/tipo_servicio/listar').then((r) => {
      expect(r.status).to.eq(200);
      expect(r.duration).to.be.lessThan(3000);
    });
    cy.request('/').its('status').should('eq', 200);
  });

  it('CP-RNF004-02: Un error en la API no tumba el servidor (JSON malformado)', () => {
    cy.request({
      method: 'POST',
      url: `${API_URL}/api/auth/login`,
      headers: { 'Content-Type': 'application/json' },
      body: '{"correo_usuario": ',
      failOnStatusCode: false,
    }).then((r) => {
      expect(r.status).to.be.within(400, 499);
    });
    cy.peticion('GET', '/api/tipo_servicio/listar').its('status').should('eq', 200);
  });
});