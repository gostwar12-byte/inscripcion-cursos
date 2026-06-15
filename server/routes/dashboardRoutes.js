const express = require('express');
const router = express.Router();

const { Usuario, Curso, Inscripcion } = require('../models');
const authenticate = require('../middleware/authMiddleware');

// Obtener estadísticas generales
router.get('/estadisticas', authenticate, async (req, res) => {
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
            group: ['cursoId'],
            order: [[require('sequelize').literal('total'), 'DESC']],
            limit: 5,
            include: [{ model: Curso, attributes: ['id', 'nombre'] }],
            raw: false
        });

        res.json({
            totalUsuarios,
            totalCursos,
            totalInscripciones,
            misInscripciones,
            cursosPopulares
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener estadísticas'
        });
    }
});

// Obtener información del usuario autenticado
router.get('/usuario', authenticate, async (req, res) => {
    try {
        const usuario = await Usuario.findByPk(req.usuario.id, {
            attributes: { exclude: ['password'] }
        });

        if (!usuario) {
            return res.status(404).json({
                mensaje: 'Usuario no encontrado'
            });
        }

        res.json(usuario);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener información del usuario'
        });
    }
});

module.exports = router;
