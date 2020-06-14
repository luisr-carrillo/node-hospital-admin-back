const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();

app.get('/:tipo/:img', (req, res, next) => {
    const { tipo, img } = req.params;

    const pathImg = path.resolve(__dirname, `../uploads/${tipo}/${img}`);

    if (fs.existsSync(pathImg)) {
        res.sendFile(pathImg);
    } else {
        const pathNoImg = path.resolve(__dirname, '../assets/no-img.jpg');
        res.sendFile(pathNoImg);
    }
});

module.exports = app;
