// Requires
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
// Rutas requires
const appRoutes = require('./routes/app');
const usuarioRoutes = require('./routes/usuario');
const loginRoutes = require('./routes/login');
const hospitalRoutes = require('./routes/hospital');
const medicoRoutes = require('./routes/medico');
const busquedaRoutes = require('./routes/busqueda');

// Inicializar variables
const app = express();

// Body Parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

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
app.use('/usuario', usuarioRoutes);
app.use('/hospital', hospitalRoutes);
app.use('/medico', medicoRoutes);

app.use('/login', loginRoutes);
app.use('/busqueda', busquedaRoutes);

app.use('/', appRoutes);

// Escuchar peticiones
app.listen(3000, () => {
    console.log('Servidor back-end: \x1b[32m%s\x1b[0m', 'ONLINE');
});
