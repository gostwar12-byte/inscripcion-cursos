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

        const dataRaw = await response.json();

        // 🕵️‍♂️ LOG TEMPORAL: Esto nos dejará ver la verdad en F12 si sigue fallando
        console.log("Estructura exacta recibida de la BD:", dataRaw);

        // 🟢 NUEVA EXTRACCIÓN ULTRA-FLEXIBLE:
        const inscripciones = dataRaw.data?.inscripciones || dataRaw.inscripciones || dataRaw.data || dataRaw;

        container.innerHTML = '';

        // Validamos que 'inscripciones' sea realmente una lista antes de continuar
        if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes inscripciones todavía.</p>';
            return;
        }

        inscripciones.forEach(item => {
            // Buscamos el objeto Curso por si viene plano o anidado en Sequelize
            const curso = item.Curso || item.curso || item;

            if (!curso) return; // Salvaguarda por si hay una inscripción huérfana

            container.innerHTML += `
                <div class="curso-card">
                    <h3>${curso.nombre || 'Curso sin nombre'}</h3>
                    <p>${curso.descripcion || 'Sin descripción disponible'}</p>
                    <div class="curso-meta">
                        <span>📅 ${curso.fechaInicio ? new Date(curso.fechaInicio).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                        <span>👥 ${curso.cupos ?? 0} cupos</span>
                    </div>
                    <div class="curso-actions">
                        <button class="btn btn-small btn-danger" onclick="cancelarInscripcion(${item.id})">Cancelar inscripción</button>
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
    const confirmar = confirm('¿Estás seguro de que deseas cancelar esta inscripción?');
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        const dataRaw = await response.json();
        
        // 🟢 SOLUCIÓN: Buscar el mensaje de éxito de forma flexible
        const msg = dataRaw.mensaje || dataRaw.data?.mensaje || 'Inscripción cancelada correctamente';

        if (response.ok) {
            mostrarNotificacion(msg, 'success');
            cargarMisInscripciones();
        } else {
            mostrarNotificacion(msg || 'Error al cancelar inscripción', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cancelar inscripción', 'error');
    }
}

window.cancelarInscripcion = cancelarInscripcion;

// Ejecutar carga inicial
cargarMisInscripciones();