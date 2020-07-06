const jwt = require('jsonwebtoken');
const SEED = require('../config/config').SEED;

/**
 * @desc Verificar Token
 */

exports.verificaToken = function (req, res, next) {
    const token = req.query.token;

    jwt.verify(token, SEED, (err, decoded) => {
        if (err) {
            return res.status(401).json({
                ok: false,
                mensaje: 'El token es incorrecto',
                errores: err,
            });
        }

        decoded.usuario.password = ':)';

        req.usuario = decoded.usuario;

        next();
    });
};
exports.verificaAdmin = function (req, res, next) {
    const usuario = req.usuario;

    if (usuario.role === 'ADMIN_ROLE') {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'El usuario es incorrecto',
            errores: {
                message: 'No esta autorizado para realizar esta acción',
            },
        });
    }
};
exports.verificaUsuario = function (req, res, next) {
    const usuario = req.usuario;
    const id = req.params.id;
    if (usuario.role === 'ADMIN_ROLE' || usuario._id === id) {
        next();
    } else {
        return res.status(401).json({
            ok: false,
            mensaje: 'El usuario es incorrecto',
            errores: {
                message: 'Acción autorizada solamente en su cuenta',
            },
        });
    }
};
