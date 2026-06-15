# Sistema de Inscripción a Cursos

## Descripción

Aplicación web desarrollada para gestionar cursos e inscripciones de estudiantes.

El sistema permitirá registrar cursos, consultar la oferta disponible e inscribir usuarios en distintos cursos.

---

## Stack Tecnológico

### Frontend

* HTML
* CSS
* JavaScript

### Backend

* Node.js
* Express.js

### Base de Datos

* MySQL
* Sequelize ORM

### Control de versiones

* Git
* GitHub

---

## Requisitos

* Node.js v22 o superior
* npm
* MySQL Server

Verificar instalación:

```bash
node -v
npm -v
```

---

## Instalación

### Clonar repositorio

```bash
git clone https://github.com/gostwar12-byte/inscripcion-cursos.git
```

### Entrar al proyecto

```bash
cd inscripcion-cursos
```

### Instalar dependencias del backend

```bash
cd server
npm install
```

### Instalar dependencias del frontend

```bash
cd ../client
npm install
```

---

## Variables de entorno

El proyecto utiliza variables de entorno para separar la configuración del código fuente.

Se debe crear un archivo `.env` dentro de la carpeta `server` utilizando como referencia el archivo `.env.example`.

### Variables requeridas

```env
# Puerto donde corre la API
PORT=3000

# Entorno de ejecución
NODE_ENV=development

# Configuración individual de base de datos
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inscripcion_cursos
DB_USER=root
DB_PASSWORD=password

# URL completa de conexión a la base de datos
DATABASE_URL=mysql://usuario:password@localhost:3306/inscripcion_cursos

# Clave utilizada para autenticación JWT
JWT_SECRET=tu_clave_secreta

# Dominio permitido para solicitudes CORS
CORS_ORIGIN=http://localhost:5173

# URL de la API utilizada por el frontend
VITE_API_URL=http://localhost:3000/api
```

### Desarrollo local

Crear el archivo `.env` dentro de la carpeta `server` y configurar las variables necesarias para el entorno de desarrollo.

### Producción (Railway)

Las variables de entorno del backend deben configurarse desde el panel **Variables** de Railway.

Variables requeridas:

* DATABASE_URL
* JWT_SECRET
* PORT
* NODE_ENV
* CORS_ORIGIN

### Producción (Vercel o Netlify)

Las variables del frontend deben configurarse desde el panel **Environment Variables**.

Variable requerida:

* VITE_API_URL

### Importante

No se deben subir archivos `.env` al repositorio.

Todas las variables de producción deben configurarse desde los paneles de administración de cada plataforma.

---

## Ejecución local

### Levantar API

```bash
cd server
npm start
```

### Levantar Frontend

```bash
cd client
npm start
```

---

## Estructura del Proyecto

```text
inscripcion-cursos/
│
├── client/
│   ├── public/
│   └── src/
│
├── docs/
│
├── server/
│   ├── config/
│   ├── migrations/
│   ├── models/
│   ├── routes/
│   ├── src/
│   ├── .env
│   ├── package.json
│   └── package-lock.json
│
├── .env.example
├── .gitignore
└── README.md
```

---

## Estado del Proyecto

Proyecto en etapa inicial de desarrollo.

Actualmente se encuentra configurada la estructura base del repositorio, la gestión de variables de entorno y la preparación para la integración con base de datos mediante Sequelize.




hola esta es una prueba