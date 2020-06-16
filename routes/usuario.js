const bcrypt = require('bcrypt');
const express = require('express');
const app = express();

const Usuario = require('../models/usuario');
const mdAuth = require('../middlewares/autenticacion');

/**
 * @desc Obtener todos los usuarios
 */
app.get('/', (req, res, next) => {
    const desde =
        req.query.desde === 0 || !req.query.desde ? 0 : Number(req.query.desde);
    if (Number.isNaN(desde)) {
        return res.status(400).json({
            ok: false,
            errores: {
                mensaje:
                    'Solicitud mal formada, el parametro "desde" debe ser un numero',
            },
        });
    }

    Usuario.find({}, 'nombre email img role')
        .skip(desde)
        .limit(5)
        .exec((err, data) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Error al cargar usuarios',
                    errores: err,
                });
            }

            Usuario.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener total de usuarios',
                        errores: err,
                    });
                }

                return res.status(200).json({
                    ok: true,
                    usuarios: data,
                    total: conteo,
                });
            });
        });
});

/**
 * @desc Crear un nuevo usuario
 */

app.post('/', (req, res) => {
    const body = req.body;
    const { nombre, email, password, img, role } = body;

    const usuario = new Usuario({
        nombre,
        email,
        password: bcrypt.hashSync(password, 10),
        img,
        role,
    });

    usuario.save((err, usuarioCreado) => {
        if (err) {
            return res.status(400).json({
                ok: false,
                mensaje: 'Error al crear usuarios',
                errores: err,
            });
        
        }

        usuarioCreado.password = ':)';

        res.status(201).json({
            ok: true,
            mensaje: 'Usuario creado correctamente',
            usuario: usuarioCreado,
            createdBy: req.usuario,
        });
    });
});

/**
 * @desc Actualizar información de usuario por ID
 */

app.put('/:id', mdAuth.verificaToken, (req, res) => {
    const { id } = req.params;
    const { nombre, email, role } = req.body;

    Usuario.findById(id, (err, usuarioDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al buscar el usuario',
                errores: err,
            });
        }

        if (!usuarioDB) {
            return res.status(404).json({
                ok: false,
                errores: {
                    message: `No se encontro ningún usuario con el ID: ${id}`,
                },
            });
        }

        usuarioDB.nombre = nombre;
        usuarioDB.email = email;
        usuarioDB.role = role;

        usuarioDB.save((err, usuarioGuardado) => {
            if (err) {
                return res.status(400).json({
                    ok: false,
                    mensaje: 'Error al actualizar el usuario',
                    errores: err,
                });
            }

            usuarioGuardado.password = ':)';

            res.status(200).json({
                ok: true,
                mensaje: 'Usuario actualizado correctamente',
                usuarioGuardado,
            });
        });
    });
});

/**
 * @desc Eliminar usuario por ID
 */

app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    const { id } = req.params;

    Usuario.findByIdAndRemove(id, (err, usuarioEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                mensaje: 'Error al eliminar el usuario',
                errores: err,
            });
        }

        if (!usuarioEliminado) {
            return res.status(404).json({
                ok: false,
                errores: {
                    message: `No se encontro ningún usuario con el ID: ${id}`,
                },
            });
        }

        res.status(200).json({
            ok: true,
            mensaje: 'Usuario eliminado correctamente',
            usuarioEliminado,
        });
    });
});

module.exports = app;
