const express = require('express');
const app = express();

const Hospital = require('../models/hospital');
const mdAuth = require('../middlewares/autenticacion');

/**
 * @desc GET de hospitales
 */

app.get('/', (req, res) => {
    Hospital.find({})
        .populate('usuario', 'nombre email')
        .exec((err, hospitales) => {
            if (err) {
                return res.status(500).json({
                    ok: false,
                    message: 'Hubo un problema al obtener los hospitales',
                    errores: err,
                });
            }

            return res.status(200).json({
                ok: true,
                hospitales,
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
                errores: err,
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
            hospitalEliminado,
            deletedBy: req.usuario,
        });
    });
});

module.exports = app;
