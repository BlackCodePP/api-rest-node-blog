const { conexion } = require('./basedatos/conexion')
const express = require('express')
const cors = require('cors')
const rutas_articulo = require('./rutas/articulo') // Rutas

// Crear servidor Node
const app = express();
const puerto = 3900;

// Inicializar app
console.log('App de node arrancada')

// Conectar a la base de datos
conexion();

// Configurar CORS
app.use(cors());

// Convertir body a objeto JS
app.use(express.json()); // Recibir datos con content-type app/json
app.use(express.urlencoded({ extended: true })) // form-urlencoded

// Cargar las rutas
app.use('/api', rutas_articulo)

// Crear servidor y escuchar peticiones HTTP
app.listen(puerto, () => {
    console.log('Servidor corriendo en el puerto ' + puerto)
});