'use strict';

module.exports = (sequelize, DataTypes) => {
  const Curso = sequelize.define('Curso', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    descripcion: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    cupos: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    fechaInicio: {
      type: DataTypes.DATE,
      allowNull: false
    }
  }, {
    tableName: 'cursos'
  });

  Curso.associate = function(models) {
    Curso.hasMany(models.Inscripcion, {
      foreignKey: 'cursoId'
    });
  };

  return Curso;
};