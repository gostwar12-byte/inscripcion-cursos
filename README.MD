# Sistema de Inscripción a Cursos

## Descripción
Aplicación web desarrollada para gestionar cursos e inscripciones de estudiantes. El sistema permite registrar cursos, consultar la oferta disponible e inscribir usuarios en distintos cursos de forma persistente.

**Autor:** Elias Gonzalez

---

## Stack Tecnológico

### Frontend
* HTML5, CSS3, JavaScript (Vanilla JS).

### Backend
* Node.js, Express.js.

### Base de Datos
* MySQL Server, Sequelize ORM.

### Control de versiones
* Git, GitHub.

---

## Requisitos Previos
* Node.js v22.x o superior.
* npm (Node Package Manager).
* Servidor MySQL Server activo.

---

## Instalación

1. **Clonar repositorio:**
   ```bash
   git clone [https://github.com/gostwar12-byte/inscripcion-cursos.git](https://github.com/gostwar12-byte/inscripcion-cursos.git)
   cd inscripcion-cursos


## instalar dependencias
Bash
# Backend
cd server && npm install
# Frontend
cd ../client && npm install

# Puerto donde corre la API
PORT=3000

# Entorno de ejecución (development o production)
NODE_ENV=development

# Configuración de base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inscripcion_cursos
DB_USER=root
DB_PASSWORD=password

# URL completa de conexión a la base de datos (Usada por Sequelize/Railway)
DATABASE_URL=mysql://root:password@localhost:3306/inscripcion_cursos

# Clave secreta para la generación de tokens JWT
JWT_SECRET=tu_clave_secreta_super_segura

# Dominio permitido para solicitudes CORS (Front-end local o producción)
CORS_ORIGIN=http://localhost:5173

# URL de la API consumida por el frontend
VITE_API_URL=http://localhost:3000/api


## Configuración en Producción:

Backend (Railway): Configurar en el panel de variables del servicio.

Frontend (Vercel/Netlify): Configurar VITE_API_URL en las variables de entorno del dashboard.

Nota: Nunca subir archivos .env al repositorio.

## Ejecución Local y Migraciones (GEN-03)
Aplicar migraciones de BD:

Bash
cd server
npx sequelize-cli db:migrate

Iniciar Backend: npm start (en carpeta /server)

Iniciar Frontend: npm start (en carpeta /client)

## Documentación de Rutas (GEN-06)
Públicas: /api/auth/register, /api/auth/login, /api/auth/recuperar-password.

Protegidas: Todas las rutas bajo /api/cursos e /api/inscripciones requieren el header Authorization: Bearer <token>.

## Postman (GEN-11)
La colección de pruebas se encuentra en la carpeta /Postman. Importa el archivo .json en Postman para probar el flujo completo de autenticación y CRUD.

## Historial de Evolución (GEN-12)
Migración Inicial: Creación de modelos Usuario, Curso, Inscripcion.

Migración v2 (Recuperación): Se agregaron campos resetToken y resetTokenExpires a la tabla Usuarios (Tipo de cambio: AC - Agregar Campo). Justificación: Implementar flujo de recuperación de contraseña sin alterar registros existentes.

## Estructura del Proyecto
Plaintext
inscripcion-cursos/
├── client/           # Código fuente Frontend
├── Postman/          # Colección de pruebas API
├── server/           # Backend Express + Sequelize
│   ├── migrations/   # Historial de cambios a la BD
│   └── ...
└── README.md

