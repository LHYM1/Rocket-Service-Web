const swaggerAutogen = require ('swagger-autogen')();

const outputFile = './swagger.json';
const endpointsFiles = ['./app.js'];

const doc = {
    info: {
        title: 'API de pruebas del proyecto',
        description: 'API que permire la gestion de informacion Backend proyecto',
    },

    host: 'localhost:4000',
    schemes: ['http'],
}

swaggerAutogen(outputFile, endpointsFiles, doc);