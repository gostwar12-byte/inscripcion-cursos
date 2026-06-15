const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const router = express.Router();

const { Usuario } = require('../models');

// en esta parte se registra el user

router.post('/register', async (req, res, next) => {
    try {
        const { nombre, correo, password } = req.body;

        if (!nombre || !correo || !password) {
            const err = new Error('Todos los campos son obligatorios');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }

        const usuarioExistente = await Usuario.findOne({
            where: { correo }
        });

        if (usuarioExistente) {
            const err = new Error('El correo ya está registrado');
            err.statusCode = 409;
            err.code = 'DUPLICATE_EMAIL';
            return next(err);
        }

        const passwordHash = await bcrypt.hash(password, 10);

        const nuevoUsuario = await Usuario.create({
            nombre,
            correo,
            password: passwordHash
        });

        res.status(201).json({
            success: true,
            code: 'REGISTER_SUCCESS',
            message: 'Usuario registrado correctamente',
            data: {
                usuario: {
                    id: nuevoUsuario.id,
                    nombre: nuevoUsuario.nombre,
                    correo: nuevoUsuario.correo
                }
            }
        });

    } catch (error) {
        next(error);
    }
});

// en esta parte se logea


router.post('/login', async (req, res, next) => {
    try {
        const { correo, password } = req.body;

        if (!correo || !password) {
            const err = new Error('Correo y contraseña son obligatorios');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }

        const usuario = await Usuario.findOne({
            where: { correo }
        });

        if (!usuario) {
            const err = new Error('Credenciales incorrectas');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            return next(err);
        }

        const passwordValida = await bcrypt.compare(
            password,
            usuario.password
        );

        if (!passwordValida) {
            const err = new Error('Credenciales incorrectas');
            err.statusCode = 401;
            err.code = 'INVALID_CREDENTIALS';
            return next(err);
        }

        const token = jwt.sign(
            {
                id: usuario.id,
                correo: usuario.correo
            },
            process.env.JWT_SECRET,
            {
                expiresIn: '1h'
            }
        );

        res.json({
            success: true,
            code: 'LOGIN_SUCCESS',
            message: 'Login exitoso',
            data: {
                token
            }
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;