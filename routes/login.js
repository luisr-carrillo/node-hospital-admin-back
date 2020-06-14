const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');

const app = express();
const Usuario = require('../models/usuario');

const SEED = require('../config/config').SEED;
const CLIENT_ID = require('../config/config').CLIENT_ID;

// Google
const { OAuth2Client } = require('google-auth-library');
const client = new OAuth2Client(CLIENT_ID);

/**
 * @desc Google Auth
 */

async function verify(token) {
    const ticket = await client.verifyIdToken({
        idToken: token,
        audience: CLIENT_ID,
    });
    const payload = ticket.getPayload();

    return {
        nombre: payload['name'],
        email: payload['email'],
        img: payload['picture'],
        google: true,
        payload,
    };
}
// verify().catch(console.error);

app.post('/google', async (req, res) => {
    try {
        const { body } = req;
        const googleUser = await verify(body.idToken);
        const usuarioDB = await Usuario.findOne({ email: googleUser.email });

        if (usuarioDB) {
            if (!usuarioDB.google) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Debe usar su autenticación normal',
                });
            } else {
                const token = jwt.sign({ usuario: usuarioDB }, SEED, {
                    expiresIn: 14400,
                });

                res.status(200).json({
                    ok: true,
                    id: usuarioDB._id,
                    usuarioDB,
                    token,
                });
            }
        } else {
            const usuario = new Usuario();
            usuario.nombre = googleUser.nombre;
            usuario.email = googleUser.email;
            usuario.img = googleUser.img;
            usuario.google = true;
            usuario.password = ':)';

            const usuarioCreado = await usuario.save();
            const token = jwt.sign({ usuario: usuarioCreado }, SEED, {
                expiresIn: 14400,
            });
            res.status(201).json({
                ok: true,
                mensaje: 'Usuario creado correctamente',
                id: usuarioCreado._id,
                usuario: usuarioCreado,
                token,
            });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            ok: false,
            errors: { message: 'No se pudo autenticar correctamente', err },
        });
    }
});

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
    } catch (err) {
        res.status(500).json({
            ok: false,
            errors: err,
        });
    }
});

module.exports = app;
