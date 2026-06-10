const express = require('express');
const router = express.Router();

const { Curso } = require('../models');
const authenticate = require('../middleware/authMiddleware');

// Obtener todos los cursos
router.get('/', authenticate, async (req, res) => {
    try {
        const cursos = await Curso.findAll();

        res.json(cursos);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al obtener cursos'
        });
    }
});

// Obtener un curso por ID
router.get('/:id', authenticate, async (req, res) => {
    try {
        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            return res.status(404).json({
                mensaje: 'Curso no encontrado'
            });
        }

        res.json(curso);
    } catch (error) {
        res.status(500).json({
            mensaje: 'Error al buscar curso'
        });
    }
});


// Crear curso
router.post('/', authenticate, async (req, res) => {
    try {

        const {
            nombre,
            descripcion,
            cupos,
            fechaInicio
        } = req.body;

        if (!nombre || !descripcion || !cupos || !fechaInicio) {
            return res.status(400).json({
                mensaje: 'Todos los campos son obligatorios'
            });
        }

        const nuevoCurso = await Curso.create({
            nombre,
            descripcion,
            cupos,
            fechaInicio
        });

        res.status(201).json({
            mensaje: 'Curso creado correctamente',
            curso: nuevoCurso
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al crear curso'
        });
    }
});

// Actualizar curso
router.put('/:id', authenticate, async (req, res) => {
    try {

        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            return res.status(404).json({
                mensaje: 'Curso no encontrado'
            });
        }

        const {
            nombre,
            descripcion,
            cupos,
            fechaInicio
        } = req.body;

        await curso.update({
            nombre,
            descripcion,
            cupos,
            fechaInicio
        });

        res.json({
            mensaje: 'Curso actualizado correctamente',
            curso
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al actualizar curso'
        });
    }
});

// Eliminar curso
router.delete('/:id', authenticate, async (req, res) => {
    try {

        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            return res.status(404).json({
                mensaje: 'Curso no encontrado'
            });
        }

        await curso.destroy();

        res.json({
            mensaje: 'Curso eliminado correctamente'
        });

    } catch (error) {

        console.error(error);

        res.status(500).json({
            mensaje: 'Error al eliminar curso'
        });
    }
});


module.exports = router;