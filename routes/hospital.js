const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const mdAuth = require('../middlewares/autenticacion');

/**
 * @desc GET de hospital por ID
 */
app.get('/:id', (req, res) => {
    const id = req.params.id;
    Hospital.findById(id)
        .populate('usuario', 'nombre img email')
        .exec((err, hospital) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    mensaje: 'Hubo un problema al obtener el hospital',
                    errors: err,
                });
            }
            if (!hospital) {
                return res.status(400).json({
                    ok: false,
                    mensaje: `No se encontro el hospital`,
                    errors: {
                        message: `No se encontro ningún hospital con el ID: ${id}`,
                    },
                });
            }
            return res.status(200).json({ ok: true, hospital: hospital });
        });
});

/**
 * @desc GET de hospitales
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

    Hospital.find({})
        .skip(desde)
        .limit(5)
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Hubo un problema al obtener los hospitales',
                    errores: err,
                });
            }

            Hospital.count({}, (err, conteo) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        mensaje: 'Error al obtener total de hospitales',
                        errores: err,
                    });
                }
                return res.status(200).json({
                    ok: true,
                    hospitales,
                    total: conteo,
                });
            });
        });
});

/**
 * @desc POST de hospitales
 */

app.post('/', mdAuth.verificaToken, (req, res) => {
    const { nombre } = req.body;

    const hospital = new Hospital({
        nombre,
        usuario: req.usuario._id,
    });

    hospital.save((err, hospitalCreado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Hubo un problema al crear el hospital',
                errores: err,
            });
        }

        return res.status(201).json({
            ok: true,
            message: 'Hospital creado correctamente',
            hospital: hospitalCreado,
            createdBy: req.usuario,
        });
    });
});

/**
 * @desc PUT actualiza hospital
 */

app.put('/:id', mdAuth.verificaToken, (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;

    if (!id || !nombre) {
        return res.status(400).json({
            ok: false,
            errores: { message: 'El ID y nombre es obligatorio' },
        });
    }

    Hospital.findById(id, (err, hospitalDB) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Hubo un problema al buscar los hospitales',
                errores: err,
            });
        }
        if (!hospitalDB) {
            return res.status(404).json({
                ok: false,
                message: `No se encontro ningún hospital con el ID: ${id}`,
            });
        }

        hospitalDB.nombre = nombre;
        hospitalDB.usuario = req.usuario._id;

        hospitalDB.save((err, hospitalGuardado) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Hubo un problema al actualizar el hospital',
                    errores: err,
                });
            }

            return res.status(200).json({
                ok: true,
                message: 'Hospital actualizado correctamente',
                hospital: hospitalGuardado,
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

    Hospital.findByIdAndRemove(id, (err, hospitalEliminado) => {
        if (err) {
            return res.status(500).json({
                ok: false,
                message: 'Hubo un problema al buscar los hospitales',
                errores: err,
            });
        }
        if (!hospitalEliminado) {
            return res.status(404).json({
                ok: false,
                message: `No se encontro ningún hospital con el ID: ${id}`,
                errores: err,
            });
        }

        return res.status(200).json({
            ok: true,
            message: 'Hospital eliminado correctamente',
            hospital: hospitalEliminado,
            deletedBy: req.usuario,
        });
    });
});

module.exports = app;
