const express = require('express');
const fileUpload = require('express-fileupload');
const fs = require('fs');
const app = express();

const Usuario = require('../models/usuario');
const Medico = require('../models/medico');
const Hospital = require('../models/hospital');

app.use(fileUpload());

app.put('/:tipo/:id', (req, res, next) => {
    const { id, tipo } = req.params;

    // Validacion de tipos
    const tiposValidos = ['hospitales', 'medicos', 'usuarios'];
    if (tiposValidos.indexOf(tipo) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Tipo de colección no valido',
            errors: {
                message: `Los tipos de colección validos son: ${tiposValidos.join(
                    ', '
                )}`,
            },
        });
    }

    if (!req.files) {
        res.status(500).json({
            ok: false,
            mensaje: 'No se selecciono ningún archivo',
            errors: {
                message: 'Debe seleccionar una imagen',
            },
        });
    }

    const archivo = req.files.imagen;
    const archivoSplit = archivo.name.split('.');
    const ext = archivoSplit[archivoSplit.length - 1];

    // Extensiones permitidas
    const extValidas = ['png', 'jpg', 'jpeg', 'gif'];
    if (extValidas.indexOf(ext) < 0) {
        res.status(400).json({
            ok: false,
            mensaje: 'Extension no valida',
            errors: {
                message: `Las extensiones validas son: ${extValidas.join(
                    ', '
                )}`,
            },
        });
    }

    // Nombre de archivo personalizado
    const nombreArchivo = `${id}-${new Date().getMilliseconds()}.${ext}`;

    // Mover archivo de TEMP a carpeta estatica
    const path = `./uploads/${tipo}/${nombreArchivo}`;

    archivo.mv(path, (err) => {
        if (err) {
            res.status(500).json({
                ok: false,
                mensaje: 'Error al mover el archivo',
                errors: err,
            });
        }

        subirPorTipo(tipo, id, nombreArchivo, res);
    });
});

function subirPorTipo(tipo, id, nombreArchivo, res) {
    switch (tipo) {
        case 'usuarios':
            Usuario.findById(id, (err, usuarioDB) => {
                if (err) {
                    return res.status(500).json({
                        ok: false,
                        message: 'Hubo un problema al buscar los usuarios',
                        errores: err,
                    });
                }
                if (!usuarioDB) {
                    return res.status(404).json({
                        ok: false,
                        message: `No se encontro ningún usuario con el ID: ${id}`,
                        errores: err,
                    });
                }

                // Validar y eliminar imagen anterior
                const oldPath = `./uploads/usuarios/${usuarioDB.img}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje:
                                    'Error al eliminar la imagen antigua de usuario',
                                errors: err,
                            });
                        }
                    });
                }

                usuarioDB.img = nombreArchivo;
                usuarioDB.save((err, usuarioActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar un usuario',
                            errors: err,
                        });
                    }

                    usuarioActualizado.password = ':)';

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de usuario actualizada correctamente',
                        usuario: usuarioActualizado,
                    });
                });
            });
            break;
        case 'medicos':
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

                // Validar y eliminar imagen anterior
                const oldPath = `./uploads/medicos/${medicoDB.img}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje:
                                    'Error al eliminar la imagen antigua de medico',
                                errors: err,
                            });
                        }
                    });
                }

                medicoDB.img = nombreArchivo;
                medicoDB.save((err, medicoActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar un medico',
                            errors: err,
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de medico actualizada correctamente',
                        usuario: medicoActualizado,
                    });
                });
            });
            break;

        case 'hospitales':
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

                // Validar y eliminar imagen anterior
                const oldPath = `./uploads/hospitales/${hospitalDB.img}`;
                if (fs.existsSync(oldPath)) {
                    fs.unlink(oldPath, (err) => {
                        if (err) {
                            return res.status(500).json({
                                ok: false,
                                mensaje:
                                    'Error al eliminar la imagen antigua de hospital',
                                errors: err,
                            });
                        }
                    });
                }

                hospitalDB.img = nombreArchivo;
                hospitalDB.save((err, hospitalActualizado) => {
                    if (err) {
                        return res.status(500).json({
                            ok: false,
                            mensaje: 'Error al actualizar un hospital',
                            errors: err,
                        });
                    }

                    return res.status(200).json({
                        ok: true,
                        mensaje: 'Imagen de hospital actualizada correctamente',
                        usuario: hospitalActualizado,
                    });
                });
            });
            break;

        default:
            return res.status(400).json({
                ok: false,
                errors: {
                    mensaje: 'Tipo de colección no valido',
                },
            });
    }
}

module.exports = app;
