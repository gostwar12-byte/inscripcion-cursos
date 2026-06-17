require('dotenv').config();

module.exports = {
  development: {
    username: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "1234",
    database: process.env.DB_NAME || "inscripcion_cursos",
    host: process.env.DB_HOST || "127.0.0.1",
    dialect: "mysql"
  },
  production: {
    // Railway inyecta la URL completa de conexión automáticamente
    use_env_variable: "DATABASE_URL",
    dialect: "mysql",
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false // Necesario para conexiones remotas a BD en la nube
      }
    }
  }
};