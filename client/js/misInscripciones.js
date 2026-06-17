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

        console.log("Estructura exacta recibida de la BD:", dataRaw);

        const inscripciones = dataRaw.data?.inscripciones || dataRaw.inscripciones || dataRaw.data || dataRaw;

        container.innerHTML = '';

        if (!Array.isArray(inscripciones) || inscripciones.length === 0) {
            container.innerHTML = '<p class="text-muted">No tienes inscripciones todavía.</p>';
            return;
        }

        inscripciones.forEach(item => {
            const curso = item.Curso || item.curso || item;

            if (!curso) return; 

            // Dejamos listo el nombre limpio escapando comillas para evitar errores en el HTML
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

// 🟢 FUNCIÓN rq-10: Ventana emergente con el diploma oficial imprimible
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
                <title>Certificado de Inscripción - ${nombreCurso}</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; background-color: #f5f5f5; padding: 30px; text-align: center; color: #333; }
                    .certificado-border { border: 8px double #2c3e50; padding: 40px; background-color: white; max-width: 700px; margin: 0 auto; box-shadow: 0 4px 15px rgba(0,0,0,0.1); }
                    .header h1 { font-size: 2.3rem; color: #2c3e50; margin-bottom: 5px; text-transform: uppercase; letter-spacing: 2px; }
                    .header p { font-size: 1.1rem; color: #7f8c8d; margin-top: 0; margin-bottom: 40px; font-style: italic; }
                    .presentacion { font-size: 1.2rem; margin-bottom: 10px; }
                    .nombre-alumno { font-size: 2.2rem; font-weight: bold; color: #d35400; margin: 20px 0; border-bottom: 2px solid #eee; display: inline-block; padding-bottom: 5px; }
                    .detalle { font-size: 1.1rem; line-height: 1.6; max-width: 550px; margin: 0 auto 40px auto; }
                    .fecha-emision { font-size: 0.95rem; color: #95a5a6; margin-bottom: 50px; }
                    .firmas { display: flex; justify-content: space-around; margin-top: 40px; }
                    .firma-bloque { border-top: 1px solid #bdc3c7; width: 200px; padding-top: 8px; font-size: 0.9rem; color: #7f8c8d; }
                    .btn-imprimir { background-color: #27ae60; color: white; border: none; padding: 10px 25px; font-size: 1rem; border-radius: 4px; cursor: pointer; font-weight: bold; margin-top: 30px; }
                    @media print { .btn-imprimir { display: none; } body { background: white; padding: 0; } .certificado-border { box-shadow: none; margin: 0; } }
                </style>
            </head>
            <body>
                <div class="certificado-border">
                    <div class="header">
                        <h1>Certificado Oficial</h1>
                        <p>Sistema de Gestión e Inscripción de Cursos</p>
                    </div>
                    <p class="presentacion">Se otorga el presente comprobante a:</p>
                    <div class="nombre-alumno">Elias Gonzalez</div>
                    <p class="detalle">
                        Por haber completado exitosamente el proceso de postulación e incorporación formal en el curso de especialización técnica denominado: <br>
                        <strong>"${nombreCurso}"</strong>.
                    </p>
                    <p class="fecha-emision">Documento emitido de forma electrónica el ${fechaHoy}</p>
                    <div class="firmas">
                        <div class="firma-bloque">Dirección Académica</div>
                        <div class="firma-bloque">Sello de Registro Oficial</div>
                    </div>
                    <button class="btn-imprimir" onclick="window.print()">🖨️ Guardar o Imprimir PDF</button>
                </div>
            </body>
            </html>
        `);
        ventanaCertificado.document.close();
    } catch (e) {
        console.error("Error generando certificado:", e);
    }
};

async function cancelarInscripcion(inscripcionId) {
    const confirmar = confirm('¿Estás seguro de que deseas cancelar esta inscripción?');
    if (!confirmar) return;

    try {
        const response = await fetch(`http://localhost:3000/api/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        const dataRaw = await response.json();
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