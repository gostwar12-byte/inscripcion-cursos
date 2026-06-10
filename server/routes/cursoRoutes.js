const express = require('express');
const router = express.Router();

const authenticate = require('../middlewares/authMiddleware');

router.get('/protegida', authenticate, (req, res) => {

    res.json({
        mensaje: 'Acceso autorizado',
        usuario: req.usuario
    });

});

module.exports = router;