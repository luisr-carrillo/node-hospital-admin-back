const express = require('express');
const app = express();

const Medico = require('../models/medico');
const mdAuth = require('../middlewares/autenticacion');

/**
 * @desc GET de Medico por ID
 */
app.get('/:id', (req, res) => {
    const id = req.params.id;
    Medico.findById(id)
        .populate('usuario', 'nombre img email')
        .populate('hospital')
        .exec((err, medico) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Hubo un problema al obtener el medico',
                    errors: err,
                });
            }
            if (!medico) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `No se encontro el medico`,
                    errors: {
                        message: `No se encontro ningún medico con el ID: ${id}`,
                    },
                });
            }
            return res.status(200).json({ ok: true, medico: medico });
        });
});

/**
 * @desc Función para obtener todos los medicos
 */
app.get('/', (req, res) => {
    const desde =
        req.query.desde === 0 || !req.query.desde ? 0 : Number(req.query.desde);
    if (Number.isNaN(desde)) {
        return res.status(400).json({
            ok: false,
            errores: {
                mensaje:
                    'Solicitud mal formada. El parametro "desde" debe ser un numero',
            },
        });
    }

    Medico.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .populate('hospital')
        .exec((err, medicos) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Hubo un problema al obtener los medicos',
                    errores: err,
                });
            }

            Medico.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener total de medicos',
                        errores: err,
                    });
                }

                return res.status(200).json({
                    ok: true,
                    medicos,
                    total: conteo,
                });
            });
        });
});

/**
 * @desc Función para agregar un nuevo medico
 */
app.post('/', mdAuth.verificaToken, (req, res) => {
    const { nombre, hospital } = req.body;

    const medico = new Medico({
        nombre,
        hospital,
        usuario: req.usuario._id,
    });

    medico.save((err, medicoCreado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Hubo un problema al crear el medico',
                errores: err,
            });
        }

        return res.status(201).json({
            ok: true,
            message: 'Medico creado correctamente',
            medico: medicoCreado,
            createdBy: req.usuario,
        });
    });
});

/**
 * @desc Función para modificar un medico por su ID
 */
app.put('/:id', mdAuth.verificaToken, (req, res) => {
    const { id } = req.params;
    const { nombre, hospital } = req.body;

    if (!id || (!nombre && !hospital)) {
        return res.status(400).json({
            ok: false,
            errores: {
                message: 'El ID, nombre u hospital no fue proporcionado',
            },
        });
    }

    Medico.findById(id, (err, medicoDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Hubo un problema al buscar los medicos',
                errores: err,
            });
        }
        if (!medicoDB) {
            return res.status(404).json({
                ok: false,
                message: `No se encontro ningún medico con el ID: ${id}`,
                errores: err,
            });
        }

        medicoDB.nombre = nombre;
        medicoDB.hospital = hospital;
        medicoDB.usuario = req.usuario._id;

        medicoDB.save((err, medicoGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Hubo un problema al actualizar el medico',
                    errores: err,
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'Medico actualizado correctamente',
                medico: medicoGuardado,
                updatedBy: req.usuario,
            });
        });
    });
});

/**
 * @desc Función para eliminar un hospital de la base de datos
 */
app.delete('/:id', mdAuth.verificaToken, (req, res) => {
    const { id } = req.params;

    if (!id) {
        return res.status(400).json({
            ok: false,
            errores: { message: 'El ID es obligatorio' },
        });
    }

    Medico.findByIdAndRemove(id, (err, medicoEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Hubo un problema al buscar los medicos',
                errores: err,
            });
        }
        if (!medicoEliminado) {
            return res.status(404).json({
                ok: false,
                message: `No se encontro ningún medico con el ID: ${id}`,
                errores: err,
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Medico eliminado correctamente',
            medico: medicoEliminado,
            deletedBy: req.usuario,
        });
    });
});

module.exports = app;
