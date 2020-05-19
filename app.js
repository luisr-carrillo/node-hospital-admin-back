// Requires
const express = require('express');
const mongoose = require('mongoose');

// Inicializar variables
const app = express();

// Conexión a mongoDB
mongoose.connection.openUri(
    'mongodb://localhost:27017/hospital-admin',
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useCreateIndex: true,
    },
    (err, res) => {
        if (err) throw err;

        console.log('Conexión a mongodb: \x1b[32m%s\x1b[0m', 'ONLINE');
    }
);

// Rutas
app.get('/', (req, res, next) => {
    res.status(200).json({
        ok: true,
        mensaje: 'Peticion realizada correctamente',
    });
});

// Escuchar peticioens
app.listen(3000, () => {
    console.log('Servidor back-end: \x1b[32m%s\x1b[0m', 'ONLINE');
});
