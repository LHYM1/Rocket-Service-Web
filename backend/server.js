
import app from './src/app.js';
import swaggerUi from 'swagger-ui-express';
import swaggerDocumentation from './swagger.json' with {type: 'json'};

// Configuración de swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocumentation)) ;

// Documentación apis con swagger
app.get("/private", (req, res) => {
    res.send("Proceso Privado ¡¡¡¡")
})

app.post("/private/adicionar", (req, res) => {
    res.send("Simula Adicionar Datos ¡¡¡¡")
})

app.put("/private/modificar", (req, res) => {
    res.send("Simula Actualizar datos ¡¡¡¡")
})

app.delete("/private/eliminar", (req, res) => {
    res.send("Simula Eliminar datos ¡¡¡¡")
})

// Puerto de escucha del servidor
const PORT = process.env.PORT || 4000;

// Iniciar el servidor
app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
    console.log(`Base de datos conectada exitosamente`);
});

