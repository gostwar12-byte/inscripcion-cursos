'use strict';

module.exports = (sequelize, DataTypes) => {
  const Usuario = sequelize.define('Usuario', {
    nombre: {
      type: DataTypes.STRING,
      allowNull: false
    },
    correo: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    }
  }, {
    tableName: 'usuarios'
  });

  Usuario.associate = function(models) {
    Usuario.hasMany(models.Inscripcion, {
      foreignKey: 'usuarioId'
    });
  };

  return Usuario;
};