const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const { Usuario } = require('../models');

router.post('/register', async (req, res) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const usuarioExistente = await Usuario.findOne({
            where: { correo }
        });

        if (usuarioExistente) {
            return res.status(409).json({
                mensaje: 'El correo ya está registrado'
            });
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = await Usuario.create({
            nombre,
            correo,
            password: passwordHash
        });

        res.status(201).json({
            mensaje: 'Usuario registrado correctamente',
            usuario: {
                id: nuevoUsuario.id,
                nombre: nuevoUsuario.nombre,
                correo: nuevoUsuario.correo
            }
        });

    } catch (error) {
        console.error(error);

        res.status(500).json({
            mensaje: 'Error interno del servidor'
        });
    }
});

module.exports = router;