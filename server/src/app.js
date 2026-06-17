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

// 🟢 SOLUCIÓN CORS: Configurado específicamente para tu frontend en Vercel
app.use(cors({
    origin: 'https://inscripcion-cursos-1s3boewlw-elias25.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));

app.use(express.json());

// Nota: app.use(express.static('../client')) funciona en local, 
// pero en Railway no es necesario ya que el frontend vive en Vercel.
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