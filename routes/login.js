const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const express = require('express');

const app = express();

const mdAuth = require('../middlewares/autenticacion');
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

app.get('/renuevatoken', mdAuth.verificaToken, (req, res) => {
    const token = jwt.sign({ usuario: req.usuario }, SEED, {
        expiresIn: 14400,
    });

    return res.status(200).json({
        ok: true,
        token,
    });
});

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
                    usuario: usuarioDB,
                    token,
                    menu: obtenerMenu(usuarioDB.role),
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
                menu: obtenerMenu(usuarioCreado.role),
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
            usuario: usuarioDB,
            token,
            menu: obtenerMenu(usuarioDB.role),
        });
    } catch (err) {
        res.status(500).json({
            ok: false,
            errors: err,
        });
    }
});

function obtenerMenu(role) {
    const menu = [
        {
            titulo: 'Principal',
            icono: 'mdi mdi-gauge',
            submenu: [
                { titulo: 'Dashboard', url: '/dashboard' },
                { titulo: 'ProgressBar', url: '/progress' },
                { titulo: 'Graphics', url: '/graphics' },
                // { titulo: 'Promesas', url: '/promesas' },
                // { titulo: 'RxJS', url: '/rxjs' },
            ],
        },
        {
            titulo: 'Mantenimientos',
            icono: 'mdi mdi-folder-lock-open',
            submenu: [
                // { titulo: 'Usuarios', url: '/usuarios' },
                { titulo: 'Hospitales', url: '/hospitales' },
                { titulo: 'Medicos', url: '/medicos' },
            ],
        },
    ];

    if (role === 'ADMIN_ROLE') {
        menu[1].submenu.unshift({ titulo: 'Usuarios', url: '/usuarios' });
    }

    return menu;
}

module.exports = app;
