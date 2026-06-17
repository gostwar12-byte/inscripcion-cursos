require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('../middleware/errorHandler');

// Rutas
const authRoutes = require('../routes/authRoutes');
const cursoRoutes = require('../routes/cursoRoutes');
const inscripcionRoutes = require('../routes/inscripcionRoutes');
const dashboardRoutes = require('../routes/dashboardRoutes');

const app = express();

// 🟢 SOLUCIÓN CORS ROBUSTA
// 1. Configuración principal de CORS
const corsOptions = {
    origin: 'https://inscripcion-cursos-c1g0nq8f4-elias25.vercel.app', // Asegúrate que esta sea tu URL actual
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
};

app.use(cors(corsOptions));

// 2. Manejo explícito de peticiones OPTIONS (Preflight)
app.options('*', cors(corsOptions));

app.use(express.json());

// Servir archivos estáticos
app.use(express.static('../client'));

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Sistema de Inscripción a Cursos - Conectada correctamente'
    });
});

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);
app.use('/api/inscripciones', inscripcionRoutes);
app.use('/api/dashboard', dashboardRoutes);

// 404 - Ruta no encontrada
app.use((req, res) => {
  res.status(404).json({
    success: false,
    code: 'NOT_FOUND',
    message: 'Recurso no encontrado'
  });
});

// Middleware de manejo de errores
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});