// 🟢 CONFIGURACIÓN: URL de tu servidor en Railway
const API_URL = 'https://inscripcion-cursos-production-bd3c.up.railway.app';

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
        // 🟢 URL corregida con API_URL
        const response = await fetch(`${API_URL}/api/inscripciones/mis-inscripciones`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        if (!response.ok) {
            throw new Error('No se pudieron cargar las inscripciones');
        }

        const dataRaw = await response.json();
        const inscripciones = dataRaw.data?.inscripciones || dataRaw.inscripciones || dataRaw.data || dataRaw;

        container.innerHTML = '';

        if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes inscripciones todavía.</p>';
            return;
        }

        inscripciones.forEach(item => {
            const curso = item.Curso || item.curso || item;
            if (!curso) return; 

            const nombreCursoLimpio = (curso.nombre || 'Curso sin nombre').replace(/"/g, '&quot;');

            container.innerHTML += `
                <div class="curso-card">
                    <h3>${curso.nombre || 'Curso sin nombre'}</h3>
                    <p>${curso.descripcion || 'Sin descripción disponible'}</p>
                    <div class="curso-meta">
                        <span>📅 ${curso.fechaInicio ? new Date(curso.fechaInicio).toLocaleDateString('es-ES') : 'Sin fecha'}</span>
                        <span>👥 ${curso.cupos ?? 0} cupos</span>
                    </div>
                    <div class="curso-actions" style="margin-top: 1rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
                        <button class="btn btn-small btn-danger" onclick="cancelarInscripcion(${item.id})">Cancelar inscripción</button>
                        <button class="btn btn-small btn-primary" 
                                data-nombre="${nombreCursoLimpio}" 
                                onclick="emitirCertificado(this)" 
                                style="background-color: #2c3e50; border-color: #2c3e50;">
                            📜 Certificado
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        container.innerHTML = '<p class="text-muted">Error al cargar inscripciones</p>';
    }
}

window.emitirCertificado = function(boton) {
    try {
        const nombreCurso = boton.getAttribute('data-nombre');
        const fechaHoy = new Date().toLocaleDateString('es-ES');
        const ventanaCertificado = window.open('', '_blank', 'width=800,height=600');
        
        ventanaCertificado.document.write(`
            <!DOCTYPE html>
            <html lang="es">
            <head>
                <meta charset="UTF-8">
                <title>Certificado - ${nombreCurso}</title>
                <style>
                    body { font-family: sans-serif; padding: 30px; text-align: center; }
                    .certificado-border { border: 8px double #2c3e50; padding: 40px; }
                    .btn-imprimir { background-color: #27ae60; color: white; border: none; padding: 10px 25px; cursor: pointer; margin-top: 20px; }
                    @media print { .btn-imprimir { display: none; } }
                </style>
            </head>
            <body>
                <div class="certificado-border">
                    <h1>Certificado Oficial</h1>
                    <p>Curso: <strong>${nombreCurso}</strong></p>
                    <p>Emitido el ${fechaHoy}</p>
                    <button class="btn-imprimir" onclick="window.print()">🖨️ Guardar o Imprimir PDF</button>
                </div>
            </body>
            </html>
        `);
        ventanaCertificado.document.close();
    } catch (e) {
        console.error(e);
    }
};

async function cancelarInscripcion(inscripcionId) {
    if (!confirm('¿Seguro que deseas cancelar?')) return;

    try {
        // 🟢 URL corregida con API_URL
        const response = await fetch(`${API_URL}/api/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        const dataRaw = await response.json();
        const msg = dataRaw.mensaje || dataRaw.data?.mensaje || 'Inscripción cancelada';

        if (response.ok) {
            mostrarNotificacion(msg, 'success');
            cargarMisInscripciones();
        } else {
            mostrarNotificacion(msg, 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cancelar', 'error');
    }
}

window.cancelarInscripcion = cancelarInscripcion;
cargarMisInscripciones();