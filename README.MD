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
git clone URL_DEL_REPOSITORIO
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

Crear un archivo `.env` tomando como referencia `.env.example`.

Variables requeridas:

```env
PORT=3000

DB_HOST=localhost
DB_PORT=3306
DB_NAME=inscripcion_cursos
DB_USER=root
DB_PASSWORD=password

JWT_SECRET=tu_clave_secreta
```

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
client/
 ├── src/
 └── public/

server/
 ├── src/
 ├── routes/
 ├── models/
 ├── migrations/
 └── config/

.env.example
.gitignore
README.md
```

---

## Estado del Proyecto

Proyecto en etapa inicial de desarrollo.
