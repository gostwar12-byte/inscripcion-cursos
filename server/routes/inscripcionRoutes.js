const express = require('express');
const router = express.Router();

const { Inscripcion, Usuario, Curso } = require('../models');
const authenticate = require('../middleware/authMiddleware');

// Obtener todas las inscripciones del usuario autenticado
router.get('/mis-inscripciones', authenticate, async (req, res) => {
    try {
        const inscripciones = await Inscripcion.findAll({
            where: { usuarioId: req.usuario.id },
            include: [{ model: Curso }]
        });

        res.json(inscripciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener inscripciones'
        });
    }
});

// Obtener todas las inscripciones (admin)
router.get('/', authenticate, async (req, res) => {
    try {
        const inscripciones = await Inscripcion.findAll({
            include: [
                { model: Usuario },
                { model: Curso }
            ]
        });

        res.json(inscripciones);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al obtener inscripciones'
        });
    }
});

// Crear inscripción
router.post('/', authenticate, async (req, res) => {
    try {
        const { cursoId } = req.body;

        if (!cursoId) {
            return res.status(400).json({
                mensaje: 'El ID del curso es obligatorio'
            });
        }

        // Verificar si el curso existe
        const curso = await Curso.findByPk(cursoId);
        if (!curso) {
            return res.status(404).json({
                mensaje: 'Curso no encontrado'
            });
        }

        // Verificar si ya está inscrito
        const inscripcionExistente = await Inscripcion.findOne({
            where: {
                usuarioId: req.usuario.id,
                cursoId: cursoId
            }
        });

        if (inscripcionExistente) {
            return res.status(409).json({
                mensaje: 'Ya estás inscrito en este curso'
            });
        }

        const nuevaInscripcion = await Inscripcion.create({
            usuarioId: req.usuario.id,
            cursoId: cursoId
        });

        res.status(201).json({
            mensaje: 'Inscripción realizada correctamente',
            inscripcion: nuevaInscripcion
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al crear inscripción'
        });
    }
});

// Cancelar inscripción
router.delete('/:id', authenticate, async (req, res) => {
    try {
        const inscripcion = await Inscripcion.findByPk(req.params.id);

        if (!inscripcion) {
            return res.status(404).json({
                mensaje: 'Inscripción no encontrada'
            });
        }

        // Verificar que el usuario sea el dueño de la inscripción
        if (inscripcion.usuarioId !== req.usuario.id) {
            return res.status(403).json({
                mensaje: 'No tienes permiso para cancelar esta inscripción'
            });
        }

        await inscripcion.destroy();

        res.json({
            mensaje: 'Inscripción cancelada correctamente'
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            mensaje: 'Error al cancelar inscripción'
        });
    }
});

module.exports = router;
