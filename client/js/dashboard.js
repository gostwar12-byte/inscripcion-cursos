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
        // 1. Traer información del usuario
        const usuarioResponse = await fetch(
            'http://localhost:3000/api/dashboard/usuario',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        if (usuarioResponse.ok) {
            const usuarioRaw = await usuarioResponse.json();
            
            // 🟢 SOLUCIÓN 1: Desempaquetamos buscando si viene en .data.usuario, en .data o directo
            const usuario = usuarioRaw.data?.usuario || usuarioRaw.data || usuarioRaw;
            
            // Forzamos la compatibilidad con Mayúsculas/Minúsculas de la Base de Datos
            document.getElementById('nombreUsuario').textContent = usuario.nombre || usuario.Nombre || '';
            document.getElementById('emailUsuario').textContent = usuario.correo || usuario.Correo || usuario.email || usuario.Email || '';
        }

        // 2. Traer estadísticas
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

        const estadisticasRaw = await estadisticasResponse.json();
        
        // Desempaquetamos el objeto interno 'data' del backend
        const estadisticas = estadisticasRaw.data || estadisticasRaw;

        // Actualizar cards de estadísticas de forma segura
        document.getElementById('totalCursos').textContent = estadisticas.totalCursos ?? 0;
        document.getElementById('totalUsuarios').textContent = estadisticas.totalUsuarios ?? 0;
        document.getElementById('totalInscripciones').textContent = estadisticas.totalInscripciones ?? 0;
        document.getElementById('misInscripciones').textContent = estadisticas.misInscripciones ?? 0;

        // Cargar cursos populares pasando un array vacío por defecto si no existiera
        cargarCursosPopulares(estadisticas.cursosPopulares || []);

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cargar los datos del dashboard', 'error');
    }
}

function cargarCursosPopulares(cursosPopulares) {
    const container = document.getElementById('cursosPopularesContainer');
    container.innerHTML = '';

    if (!cursosPopulares || cursosPopulares.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay cursos disponibles aún</p>';
        return;
    }

    cursosPopulares.forEach((item, index) => {
        // Desempaquetamos el curso buscando en todas las capas posibles que genera Sequelize
        //linea detective 
        console.log(`=== CURSO POPULAR ${index + 1} ===`, item);

        const curso = item.Curso || item.curso || item.dataValues?.Curso || item;
        
        // Obtenemos el total de inscritos de forma segura
        const inscripciones = item.dataValues?.total ?? item.total ?? 0;
        
        // 🟢 SOLUCIÓN: Buscamos los cupos en minúscula o mayúscula en el objeto curso o en la raíz
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

// Cargar datos al iniciar
cargarDatos();

// Recargar datos cada 30 segundos
setInterval(cargarDatos, 30000);