const express = require('express');
const router = express.Router();

const { Usuario, Curso, Inscripcion } = require('../models');
const authenticate = require('../middleware/authMiddleware');

// Obtener estadísticas generales
router.get('/estadisticas', authenticate, async (req, res, next) => {
    try {
        const totalUsuarios = await Usuario.count();
        const totalCursos = await Curso.count();
        const totalInscripciones = await Inscripcion.count();
        
        // Inscripciones del usuario actual
        const misInscripciones = await Inscripcion.count({
            where: { usuarioId: req.usuario.id }
        });

        // Cursos más inscritos
        const cursosPopulares = await Inscripcion.findAll({
            attributes: [
                'cursoId',
                [require('sequelize').fn('COUNT', require('sequelize').col('cursoId')), 'total']
            ],
            // 🟢 AGREGAMOS 'Curso.id' al group para que MySQL te deje pedir más atributos del curso sin romper la consulta
            group: ['cursoId', 'Curso.id'], 
            order: [[require('sequelize').literal('total'), 'DESC']],
            limit: 5,
            // 🟢 SOLUCIÓN: Agregamos 'descripcion' y 'cupos' a los attributes
            include: [{ model: Curso, attributes: ['id', 'nombre', 'descripcion', 'cupos'] }],
            raw: false
        });

        res.json({
            success: true,
            code: 'STATISTICS_SUCCESS',
            message: 'Estadísticas obtenidas correctamente',
            data: {
                totalUsuarios,
                totalCursos,
                totalInscripciones,
                misInscripciones,
                cursosPopulares
            }
        });

    } catch (error) {
        next(error);
    }
});

// Obtener información del usuario autenticado
router.get('/usuario', authenticate, async (req, res, next) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            const err = new Error('Usuario no encontrado');
            err.statusCode = 404;
            err.code = 'USER_NOT_FOUND';
            return next(err);
        }

        res.json({
            success: true,
            code: 'USER_FOUND',
            message: 'Usuario obtenido correctamente',
            data: { usuario }
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;