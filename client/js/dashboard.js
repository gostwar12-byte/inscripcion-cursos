// 1. Define la API_URL al principio
const API_URL = 'https://inscripcion-cursos-production-bd3c.up.railway.app';

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
        // 2. Usamos API_URL en lugar de localhost:3000
        const usuarioResponse = await fetch(
            `${API_URL}/api/dashboard/usuario`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (usuarioResponse.ok) {
            const usuarioRaw = await usuarioResponse.json();
            const usuario = usuarioRaw.data?.usuario || usuarioRaw.data || usuarioRaw;
            
            document.getElementById('nombreUsuario').textContent = usuario.nombre || usuario.Nombre || '';
            document.getElementById('emailUsuario').textContent = usuario.correo || usuario.Correo || usuario.email || usuario.Email || '';
        }

        // 3. Usamos API_URL en lugar de localhost:3000
        const estadisticasResponse = await fetch(
            `${API_URL}/api/dashboard/estadisticas`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (!estadisticasResponse.ok) {
            throw new Error('No se pudieron cargar las estadísticas');
        }

        const estadisticasRaw = await estadisticasResponse.json();
        const estadisticas = estadisticasRaw.data || estadisticasRaw;

        document.getElementById('totalCursos').textContent = estadisticas.totalCursos ?? 0;
        document.getElementById('totalUsuarios').textContent = estadisticas.totalUsuarios ?? 0;
        document.getElementById('totalInscripciones').textContent = estadisticas.totalInscripciones ?? 0;
        document.getElementById('misInscripciones').textContent = estadisticas.misInscripciones ?? 0;

        cargarCursosPopulares(estadisticas.cursosPopulares || []);

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cargar los datos del dashboard', 'error');
    }
}

function cargarCursosPopulares(cursosPopulares) {
    const container = document.getElementById('cursosPopularesContainer');
    if (!container) return; // Validación extra
    container.innerHTML = '';

    if (!cursosPopulares || cursosPopulares.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay cursos disponibles aún</p>';
        return;
    }

    cursosPopulares.forEach((item, index) => {
        const curso = item.Curso || item.curso || item.dataValues?.Curso || item;
        const inscripciones = item.dataValues?.total ?? item.total ?? 0;
        const cuposTotales = curso.cupos ?? curso.Cupos ?? item.cupos ?? item.Cupos ?? 0;
        
        container.innerHTML += `
            <div class="popular-item">
                <div class="popular-rank">
                    <span class="rank-badge">${index + 1}</span>
                </div>
                <div class="popular-info">
                    <h4>${curso.nombre || curso.Nombre || 'Curso sin nombre'}</h4>
                    <p>${curso.descripcion || curso.Descripcion ? (curso.descripcion || curso.Descripcion).substring(0, 100) : ''}...</p>
                </div>
                <div class="popular-stats">
                    <div class="stat">
                        <span class="stat-num">${inscripciones}</span>
                        <span class="stat-label">Inscritos</span>
                    </div>
                    <div class="stat">
                        <span class="stat-num">${cuposTotales}</span>
                        <span class="stat-label">Cupos</span>
                    </div>
                </div>
            </div>
        `;
    });
}

cargarDatos();
setInterval(cargarDatos, 30000);