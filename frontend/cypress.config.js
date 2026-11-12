// frontend/cypress.config.js  (REEMPLAZA)
const { defineConfig } = require('cypress');
const jwt = require('jsonwebtoken');
const secretos = require('./cypress.env.json');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    viewportWidth: 1366,
    viewportHeight: 768,
    defaultCommandTimeout: 8000,
    video: false,
    retries: { runMode: 1, openMode: 0 },
    setupNodeEvents(on, config) {
      on('task', {
        firmarJwt({ payload, secret, expiresIn }) {
          return jwt.sign(payload, secret || secretos.JWT_SECRET, { expiresIn: expiresIn || '8h' });
        },
        credenciales() {
          return { correo: secretos.ADMIN_CORREO, clave: secretos.ADMIN_CLAVE };
        },
      });
      return config;
    },
  },
});