'use strict';

module.exports = (sequelize, DataTypes) => {
  const Inscripcion = sequelize.define('Inscripcion', {
    fechaInscripcion: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'inscripciones'
  });

  Inscripcion.associate = function(models) {
    Inscripcion.belongsTo(models.Usuario, {
      foreignKey: 'usuarioId'
    });

    Inscripcion.belongsTo(models.Curso, {
      foreignKey: 'cursoId'
    });
  };

  return Inscripcion;
};