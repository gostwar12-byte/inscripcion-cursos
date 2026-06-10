require('dotenv').config();
const cursoRoutes = require('../routes/cursoRoutes');
const express = require('express');
const cors = require('cors');

const authRoutes = require('../routes/authRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        mensaje: 'API Sistema de Inscripción a Cursos'
    });
});

app.use('/api/auth', authRoutes);
app.use('/api/cursos', cursoRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en puerto ${PORT}`);
});