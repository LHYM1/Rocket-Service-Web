import swaggerAutogen from 'swagger-autogen';

const doc = {
    info: {
        title: 'API de pruebas del proyecto',
        description: 'API que permire la gestion de informacion Backend proyecto',
    },

    host: 'localhost:4000',
    schemes: ['http'],
};

const outputFile = './swagger.json';
const endpointsFiles = ['./src/app.js'];

swaggerAutogen()(outputFile, endpointsFiles, doc);