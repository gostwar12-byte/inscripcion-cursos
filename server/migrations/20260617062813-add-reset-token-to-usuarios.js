'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('usuarios', 'resetToken', {
      type: Sequelize.STRING,
      allowNull: true
    });
    await queryInterface.addColumn('usuarios', 'resetTokenExpires', {
      type: Sequelize.DATE,
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('usuarios', 'resetToken');
    await queryInterface.removeColumn('usuarios', 'resetTokenExpires');
  }
};