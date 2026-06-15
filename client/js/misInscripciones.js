const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const notificacionContainer = document.getElementById('notificacionContainer');
const logoutBtn = document.getElementById('logoutBtn');
const container = document.getElementById('misInscripcionesContainer');

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

async function cargarMisInscripciones() {
    try {
        const response = await fetch('http://localhost:3000/api/inscripciones/mis-inscripciones', {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudieron cargar las inscripciones');
        }

        const inscripciones = await response.json();

        container.innerHTML = '';

        if (inscripciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes inscripciones todavía.</p>';
            return;
        }

        inscripciones.forEach(item => {
            const curso = item.Curso;

            container.innerHTML += `
                <div class="curso-card">
                    <h3>${curso.nombre}</h3>
                    <p>${curso.descripcion}</p>
                    <div class="curso-meta">
                        <span>📅 ${new Date(curso.fechaInicio).toLocaleDateString('es-ES')}</span>
                        <span>👥 ${curso.cupos} cupos</span>
                    </div>
                    <div class="curso-actions">
                        <button class="btn btn-small btn-outline" onclick="cancelarInscripcion(${item.id})">Cancelar inscripción</button>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-muted">Error al cargar inscripciones</p>';
    }
}

async function cancelarInscripcion(inscripcionId) {
    try {
        const response = await fetch(`http://localhost:3000/api/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        const data = await response.json();

        if (response.ok) {
            mostrarNotificacion(data.mensaje, 'success');
            cargarMisInscripciones();
        } else {
            mostrarNotificacion(data.mensaje || 'Error al cancelar inscripción', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cancelar inscripción', 'error');
    }
}

window.cancelarInscripcion = cancelarInscripcion;

cargarMisInscripciones();
