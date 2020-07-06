const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const Medico = require('../models/medico');
const Usuario = require('../models/usuario');

/**
 * @desc Función para realizar una busqueda general
 */
app.get('/todo/:busqueda', (req, res, next) => {
    const { busqueda } = req.params;
    const regex = new RegExp(busqueda, 'i');

    Promise.all([
        buscarHospitales(busqueda, regex),
        buscarMedicos(busqueda, regex),
        buscarUsuarios(busqueda, regex),
    ]).then((response) => {
        res.status(200).json({
            ok: true,
            data: {
                hospitales: response[0],
                medicos: response[1],
                usuarios: response[2],
            },
        });
    });
});

/**
 * @desc Función para realizar una busqueda por colección
 */
app.get('/coleccion/:tabla/:busqueda', (req, res) => {
    const { tabla, busqueda } = req.params;
    const regex = new RegExp(busqueda, 'i');

    let promesa;

    switch (tabla) {
        case 'usuarios':
            promesa = buscarUsuarios(busqueda, regex);
            break;
        case 'medicos':
            promesa = buscarMedicos(busqueda, regex);
            break;
        case 'hospitales':
            promesa = buscarHospitales(busqueda, regex);
            break;

        default:
            return res.status(400).json({
                ok: false,
                message: 'Tipo de colección no válido',
                errores: {
                    message:
                        'Los tipos de busqueda solamente son: "usuarios", "medicos" y "hospitales"',
                },
            });
    }

    promesa.then((data) => {
        res.status(200).json({
            ok: true,
            [tabla]: data,
        });
    });
});

function buscarHospitales(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Hospital.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .exec((err, hospitales) => {
                if (err) {
                    return reject(
                        'Hubo un problema al obtener los hospitales: ',
                        err
                    );
                } else {
                    resolve(hospitales);
                }
            });
    });
}
function buscarMedicos(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Medico.find({ nombre: regex })
            .populate('usuario', 'nombre email')
            .populate('hospital')
            .exec((err, medicos) => {
                if (err) {
                    return reject(
                        'Hubo un problema al obtener los medicos: ',
                        err
                    );
                } else {
                    resolve(medicos);
                }
            });
    });
}
function buscarUsuarios(busqueda, regex) {
    return new Promise((resolve, reject) => {
        Usuario.find({}, 'nombre email role img')
            .or([{ nombre: regex }, { email: regex }])
            .exec((err, usuarios) => {
                if (err) {
                    return reject(
                        'Hubo un problema al obtener los usuarios: ',
                        err
                    );
                } else {
                    resolve(usuarios);
                }
            });
    });
}

module.exports = app;
