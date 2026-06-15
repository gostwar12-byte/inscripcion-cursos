// Middleware centralizado de manejo de errores
// GEN-08: Manejo centralizado de errores y respuestas JSON

module.exports = (err, req, res, next) => {
  console.error('Error:', err);

  // Respuesta por defecto
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Error interno del servidor';
  let code = err.code || 'INTERNAL_ERROR';

  // Errores Sequelize
  if (err.name === 'SequelizeValidationError') {
    statusCode = 422;
    code = 'VALIDATION_ERROR';
    message = err.errors.map(e => e.message).join('; ');
  } else if (err.name === 'SequelizeUniqueConstraintError') {
    statusCode = 409;
    code = 'DUPLICATE_ENTRY';
    message = 'El registro ya existe';
  } else if (err.name === 'SequelizeForeignKeyConstraintError') {
    statusCode = 409;
    code = 'INVALID_REFERENCE';
    message = 'Referencia inválida';
  }

  // Errores de validación personalizados
  if (err.statusCode === 400) {
    statusCode = 400;
    code = 'BAD_REQUEST';
  } else if (err.statusCode === 401) {
    statusCode = 401;
    code = 'UNAUTHORIZED';
  } else if (err.statusCode === 403) {
    statusCode = 403;
    code = 'FORBIDDEN';
  } else if (err.statusCode === 404) {
    statusCode = 404;
    code = 'NOT_FOUND';
  } else if (err.statusCode === 409) {
    statusCode = 409;
    code = err.code || 'CONFLICT';
  }

  // En producción, no exponer stack trace
  const response = {
    success: false,
    code,
    message,
  };

  // Agregar detalles solo en desarrollo
  if (process.env.NODE_ENV !== 'production') {
    response.details = err.details || undefined;
  }

  res.status(statusCode).json(response);
};
