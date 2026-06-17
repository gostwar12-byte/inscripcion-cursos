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
    },
    // 🟢 CAMPOS AGREGADOS PARA CUMPLIR GEN-07
    resetToken: {
      type: DataTypes.STRING,
      allowNull: true // Debe ser true porque inicialmente no tienen token
    },
    resetTokenExpires: {
      type: DataTypes.DATE,
      allowNull: true
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