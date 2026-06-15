const express = require('express');
const router = express.Router();

const { Curso } = require('../models');
const authenticate = require('../middleware/authMiddleware');

// Obtener todos los cursos
router.get('/', authenticate, async (req, res, next) => {
    try {
        const cursos = await Curso.findAll();
        res.json({
            success: true,
            code: 'CURSOS_LIST_SUCCESS',
            message: 'Cursos obtenidos correctamente',
            data: { cursos }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener un curso por ID
router.get('/:id', authenticate, async (req, res, next) => {
    try {
        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            const err = new Error('Curso no encontrado');
            err.statusCode = 404;
            err.code = 'CURSO_NOT_FOUND';
            return next(err);
        }

        res.json({
            success: true,
            code: 'CURSO_FOUND',
            message: 'Curso obtenido correctamente',
            data: { curso }
        });
    } catch (error) {
        next(error);
    }
});


// Crear curso
router.post('/', authenticate, async (req, res, next) => {
    try {
        const { nombre, descripcion, cupos, fechaInicio } = req.body;

        if (!nombre || !descripcion || !cupos || !fechaInicio) {
            const err = new Error('Todos los campos son obligatorios');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }

        const nuevoCurso = await Curso.create({
            nombre,
            descripcion,
            cupos,
            fechaInicio
        });

        res.status(201).json({
            success: true,
            code: 'CURSO_CREATED',
            message: 'Curso creado correctamente',
            data: { curso: nuevoCurso }
        });

    } catch (error) {
        next(error);
    }
});

// Actualizar curso
router.put('/:id', authenticate, async (req, res, next) => {
    try {
        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            const err = new Error('Curso no encontrado');
            err.statusCode = 404;
            err.code = 'CURSO_NOT_FOUND';
            return next(err);
        }

        const { nombre, descripcion, cupos, fechaInicio } = req.body;

        await curso.update({
            nombre,
            descripcion,
            cupos,
            fechaInicio
        });

        res.json({
            success: true,
            code: 'CURSO_UPDATED',
            message: 'Curso actualizado correctamente',
            data: { curso }
        });

    } catch (error) {
        next(error);
    }
});

// Eliminar curso
router.delete('/:id', authenticate, async (req, res, next) => {
    try {
        const curso = await Curso.findByPk(req.params.id);

        if (!curso) {
            const err = new Error('Curso no encontrado');
            err.statusCode = 404;
            err.code = 'CURSO_NOT_FOUND';
            return next(err);
        }

        await curso.destroy();

        res.json({
            success: true,
            code: 'CURSO_DELETED',
            message: 'Curso eliminado correctamente',
            data: {}
        });

    } catch (error) {
        next(error);
    }
});


module.exports = router;