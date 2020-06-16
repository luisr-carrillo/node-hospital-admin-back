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
