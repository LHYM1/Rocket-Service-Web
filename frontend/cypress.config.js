const { defineConfig } = require("cypress");

module.exports = defineConfig({
<<<<<<< HEAD
  allowCypressEnv: false,

  e2e: {
=======
  e2e: {
    baseUrl: "http://localhost:3000",
>>>>>>> respaldo-proyecto
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
