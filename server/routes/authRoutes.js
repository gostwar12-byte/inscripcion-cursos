const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcrypt');
const crypto = require('crypto'); // 🟢 Agregado para generar el token aleatorio
const { Op } = require('sequelize'); // 🟢 Agregado para comparar las fechas de expiración
const router = express.Router();

const { Usuario } = require('../models');

// ==========================================
// REGISTRO DE USUARIO
// ==========================================
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

// ==========================================
// LOGIN DE USUARIO
// ==========================================
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

// ==========================================
// GEN-07: SOLICITAR TOKEN DE RECUPERACIÓN
// ==========================================
router.post('/request-reset', async (req, res, next) => {
    try {
        const { correo } = req.body;

        if (!correo) {
            const err = new Error('El correo es obligatorio');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }

        const usuario = await Usuario.findOne({ where: { correo } });
        
        // Criterio de seguridad: No revelar si el correo existe o no para evitar enumeración
        if (!usuario) {
            return res.json({
                success: true,
                code: 'RESET_REQUESTED',
                message: 'Si el correo existe en el sistema, se ha enviado el código.'
            });
        }

        // Generamos un token alfanumérico corto de 6 caracteres (ej: 4F3D2A)
        const token = crypto.randomBytes(3).toString('hex').toUpperCase();
        
        // Guardamos el token y definimos que expire en 15 minutos
        usuario.resetToken = token;
        usuario.resetTokenExpires = Date.now() + 15 * 60 * 1000; 
        await usuario.save();

        // 🚨 EVIDENCIA PARA EVALUACIÓN: Lo sacamos por consola para poder simularlo en local sin usar emails reales
        console.log(`\n=========================================`);
        console.log(`[GEN-07] RECUPERACIÓN DE CONTRASEÑA`);
        console.log(`Correo: ${correo}`);
        console.log(`TOKEN: ${token}`);
        console.log(`=========================================\n`);

        res.json({
            success: true,
            code: 'RESET_REQUESTED',
            message: 'Si el correo existe en el sistema, se ha enviado el código.'
        });

    } catch (error) {
        next(error);
    }
});

// ==========================================
// GEN-07: RESTABLECER CONTRASEÑA CON TOKEN
// ==========================================
router.post('/reset-password', async (req, res, next) => {
    try {
        const { token, password } = req.body;

        if (!token || !password) {
            const err = new Error('El token y la nueva contraseña son obligatorios');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }

        // Buscamos al usuario cuyo token coincida y que su fecha de expiración sea mayor a la actual
        const usuario = await Usuario.findOne({
            where: {
                resetToken: token,
                resetTokenExpires: { [Op.gt]: Date.now() }
            }
        });

        if (!usuario) {
            const err = new Error('El token es inválido o ha expirado');
            err.statusCode = 400;
            err.code = 'INVALID_OR_EXPIRED_TOKEN';
            return next(err);
        }

        // Hasheamos la nueva contraseña de forma segura con bcrypt
        const passwordHash = await bcrypt.hash(password, 10);
        
        usuario.password = passwordHash;
        usuario.resetToken = null;         // Limpiamos el token para que no se use dos veces
        usuario.resetTokenExpires = null;  // Limpiamos la expiración
        await usuario.save();

        res.json({
            success: true,
            code: 'PASSWORD_RESET_SUCCESS',
            message: 'Contraseña actualizada correctamente'
        });

    } catch (error) {
        next(error);
    }
});

module.exports = router;