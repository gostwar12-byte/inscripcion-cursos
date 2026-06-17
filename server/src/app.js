require('dotenv').config();
const cursoRoutes = require('../routes/cursoRoutes');
const inscripcionRoutes = require('../routes/inscripcionRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');
const express = require('express');
const cors = require('cors');
const errorHandler = require('../middleware/errorHandler');

const authRoutes = require('../routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

// 🟢 SOLUCIÓN: Hace que la carpeta 'client' sea pública a través de HTTP
// Esto permite que entres a http://localhost:3000/login.html sin restricciones de seguridad
app.use(express.static('../client'));

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Sistema de Inscripción a Cursos'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 - Ruta no encontrada (Ojo: express.static debe ir antes que esto para que encuentre los HTML)
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Recurso no encontrado'
  });
});

// Middleware de manejo de errores (debe ir al final)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});