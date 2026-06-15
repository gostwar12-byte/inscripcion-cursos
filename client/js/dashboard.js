const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const logoutBtn = document.getElementById('logoutBtn');
const notificacionContainer = document.getElementById('notificacionContainer');

function mostrarNotificacion(mensaje, tipo = 'success', duracion = 4000) {
    const notificacion = document.createElement('div');
    notificacion.className = `notificacion ${tipo}`;
    notificacion.textContent = mensaje;
    
    notificacionContainer.appendChild(notificacion);
    
    setTimeout(() => {
        notificacion.style.animation = 'slideOut 0.3s ease-out';
        setTimeout(() => notificacion.remove(), 300);
    }, duracion);
}

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

async function cargarDatos() {
    try {
        // Traer información del usuario
        const usuarioResponse = await fetch(
            'http://localhost:3000/api/dashboard/usuario',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (usuarioResponse.ok) {
            const usuario = await usuarioResponse.json();
            document.getElementById('nombreUsuario').textContent = usuario.nombre;
            document.getElementById('emailUsuario').textContent = usuario.correo;
        }

        // Traer estadísticas
        const estadisticasResponse = await fetch(
            'http://localhost:3000/api/dashboard/estadisticas',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (!estadisticasResponse.ok) {
            throw new Error('No se pudieron cargar las estadísticas');
        }

        const estadisticas = await estadisticasResponse.json();

        // Actualizar cards de estadísticas
        document.getElementById('totalCursos').textContent = estadisticas.totalCursos;
        document.getElementById('totalUsuarios').textContent = estadisticas.totalUsuarios;
        document.getElementById('totalInscripciones').textContent = estadisticas.totalInscripciones;
        document.getElementById('misInscripciones').textContent = estadisticas.misInscripciones;

        // Cargar cursos populares
        cargarCursosPopulares(estadisticas.cursosPopulares);

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cargar los datos del dashboard', 'error');
    }
}

function cargarCursosPopulares(cursosPopulares) {
    const container = document.getElementById('cursosPopularesContainer');
    container.innerHTML = '';

    if (cursosPopulares.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay cursos disponibles aún</p>';
        return;
    }

    cursosPopulares.forEach((item, index) => {
        const curso = item.Curso;
        const inscripciones = item.dataValues.total;
        
        container.innerHTML += `
            <div class="popular-item">
                <div class="popular-rank">
                    <span class="rank-badge">${index + 1}</span>
                </div>
                <div class="popular-info">
                    <h4>${curso.nombre}</h4>
                    <p>${curso.descripcion.substring(0, 100)}...</p>
                </div>
                <div class="popular-stats">
                    <div class="stat">
                        <span class="stat-num">${inscripciones}</span>
                        <span class="stat-label">Inscritos</span>
                    </div>
                    <div class="stat">
                        <span class="stat-num">${curso.cupos}</span>
                        <span class="stat-label">Cupos</span>
                    </div>
                </div>
            </div>
        `;
    });
}

// Cargar datos al iniciar
cargarDatos();

// Recargar datos cada 30 segundos
setInterval(cargarDatos, 30000);
