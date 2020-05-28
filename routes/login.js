const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');
const app = express();

const Usuario = require('../models/usuario');

const SEED = require('../config/config').SEED;

/**
 * @desc Login
 */

app.post('/', async (req, res) => {
    try {
        const { body } = req;
        const usuarioDB = await Usuario.findOne({ email: body.email });
        if (!usuarioDB) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - email',
            });
        }

        if (!bcrypt.compareSync(body.password, usuarioDB.password)) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Credenciales incorrectas - password',
            });
        }

        usuarioDB.password = ':)';
        const token = jwt.sign({ usuario: usuarioDB }, SEED, {
            expiresIn: 14400,
        });

        res.status(200).json({
            ok: true,
            id: usuarioDB._id,
            usuarioDB,
            token,
        });
    } catch (error) {
        res.status(500).json({
            ok: false,
            error,
        });
    }
});

module.exports = app;
