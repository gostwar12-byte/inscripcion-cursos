const express = require('express');
const router = express.Router();

const db = require('../models');
const { Inscripcion, Usuario, Curso } = db;
const sequelize = db.sequelize;
const authenticate = require('../middleware/authMiddleware');

// Obtener todas las inscripciones del usuario autenticado
router.get('/mis-inscripciones', authenticate, async (req, res, next) => {
    try {
        const inscripciones = await Inscripcion.findAll({
            where: { usuarioId: req.usuario.id },
            include: [{ model: Curso }]
        });

        res.json({
            success: true,
            code: 'INSCRIPCIONES_LIST_SUCCESS',
            message: 'Inscripciones obtenidas correctamente',
            data: { inscripciones }
        });
    } catch (error) {
        next(error);
    }
});

// Obtener todas las inscripciones (admin)
router.get('/', authenticate, async (req, res, next) => {
    try {
        const inscripciones = await Inscripcion.findAll({
            include: [
                { model: Usuario },
                { model: Curso }
            ]
        });

        res.json({
            success: true,
            code: 'INSCRIPCIONES_LIST_SUCCESS',
            message: 'Inscripciones obtenidas correctamente',
            data: { inscripciones }
        });
    } catch (error) {
        next(error);
    }
});

// Crear inscripción
router.post('/', authenticate, async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const { cursoId } = req.body;

        if (!cursoId) {
            await t.rollback();
            const err = new Error('El ID del curso es obligatorio');
            err.statusCode = 400;
            err.code = 'VALIDATION_ERROR';
            return next(err);
        }

        // Bloquear fila del curso para evitar condiciones de carrera
        const curso = await Curso.findByPk(cursoId, { transaction: t, lock: t.LOCK.UPDATE });
        if (!curso) {
            await t.rollback();
            const err = new Error('Curso no encontrado');
            err.statusCode = 404;
            err.code = 'CURSO_NOT_FOUND';
            return next(err);
        }

        // Verificar si ya está inscrito (dentro de la transacción)
        const inscripcionExistente = await Inscripcion.findOne({
            where: { usuarioId: req.usuario.id, cursoId: cursoId },
            transaction: t,
            lock: t.LOCK.UPDATE
        });

        if (inscripcionExistente) {
            await t.rollback();
            const err = new Error('Ya estás inscrito en este curso');
            err.statusCode = 409;
            err.code = 'ALREADY_ENROLLED';
            return next(err);
        }

        // Verificar cupos disponibles
        if (curso.cupos <= 0) {
            await t.rollback();
            const err = new Error('No hay cupos disponibles para este curso');
            err.statusCode = 400;
            err.code = 'NO_CUPOS';
            return next(err);
        }

        // Crear inscripción y decrementar cupos
        const nuevaInscripcion = await Inscripcion.create({
            usuarioId: req.usuario.id,
            cursoId: cursoId
        }, { transaction: t });

        await curso.update({ cupos: curso.cupos - 1 }, { transaction: t });

        await t.commit();

        res.status(201).json({
            success: true,
            code: 'INSCRIPCION_CREATED',
            message: 'Inscripción realizada correctamente',
            data: { inscripcion: nuevaInscripcion }
        });

    } catch (error) {
        try { await t.rollback(); } catch (e) { /* noop */ }
        next(error);
    }
});

// Cancelar inscripción
router.delete('/:id', authenticate, async (req, res, next) => {
    const t = await sequelize.transaction();
    try {
        const inscripcion = await Inscripcion.findByPk(req.params.id, { transaction: t, lock: t.LOCK.UPDATE });

        if (!inscripcion) {
            await t.rollback();
            const err = new Error('Inscripción no encontrada');
            err.statusCode = 404;
            err.code = 'INSCRIPCION_NOT_FOUND';
            return next(err);
        }

        // Verificar que el usuario sea el dueño de la inscripción
        if (inscripcion.usuarioId !== req.usuario.id) {
            await t.rollback();
            const err = new Error('No tienes permiso para cancelar esta inscripción');
            err.statusCode = 403;
            err.code = 'FORBIDDEN';
            return next(err);
        }

        // Incrementar cupos del curso asociado
        const curso = await Curso.findByPk(inscripcion.cursoId, { transaction: t, lock: t.LOCK.UPDATE });
        if (curso) {
            await curso.update({ cupos: curso.cupos + 1 }, { transaction: t });
        }

        await inscripcion.destroy({ transaction: t });

        await t.commit();

        res.json({
            success: true,
            code: 'INSCRIPCION_DELETED',
            message: 'Inscripción cancelada correctamente',
            data: {}
        });

    } catch (error) {
        try { await t.rollback(); } catch (e) { /* noop */ }
        next(error);
    }
});

module.exports = router;
