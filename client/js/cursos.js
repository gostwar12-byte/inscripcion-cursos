// 🟢 CONFIGURACIÓN: URL de tu servidor en Railway
const API_URL = 'https://inscripcion-cursos-production-bd3c.up.railway.app';

const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const cursosContainer = document.getElementById('cursosContainer');
const logoutBtn = document.getElementById('logoutBtn');
const cursoForm = document.getElementById('cursoForm');
const notificacionContainer = document.getElementById('notificacionContainer');
const cursoIdInput = document.getElementById('cursoId');
const crearCursoBtn = document.getElementById('crearCurso');
const cancelarEdicionBtn = document.getElementById('cancelarEdicion');
const filtroDisponibles = document.getElementById('filtroDisponibles');

let cursoEditandoId = null;

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

if (filtroDisponibles) {
    filtroDisponibles.addEventListener('change', () => {
        cargarCursos();
    });
}

async function cargarCursos() {
    try {
        const soloDisponibles = filtroDisponibles ? filtroDisponibles.checked : false;
        // 🟢 URL corregida con API_URL
        const urlCursos = soloDisponibles 
            ? `${API_URL}/api/cursos?disponibles=true` 
            : `${API_URL}/api/cursos`;

        const response = await fetch(urlCursos, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cursosRaw = await response.json();
        
        const cursos = cursosRaw.data?.cursos || cursosRaw.data || cursosRaw;

        // 🟢 URL corregida con API_URL
        const insResp = await fetch(`${API_URL}/api/inscripciones/mis-inscripciones`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const insRaw = insResp.ok ? await insResp.json() : { data: [] };
        
        const misInscripciones = insRaw.data?.inscripciones || insRaw.data || insRaw;

        const mapInscripciones = new Map();
        if (Array.isArray(misInscripciones)) {
            misInscripciones.forEach(i => mapInscripciones.set(i.cursoId, i.id));
        }

        cursosContainer.innerHTML = '';

        if (!Array.isArray(cursos)) {
            cursosContainer.innerHTML = '<p class="text-muted">No se encontraron cursos.</p>';
            return;
        }

        cursos.forEach(curso => {
            const inscritoId = mapInscripciones.get(curso.id);
            cursosContainer.innerHTML += `
                <div class="curso-card">
                    <h3>${curso.nombre}</h3>
                    <p>${curso.descripcion}</p>
                    <div class="curso-meta">
                        <span>📅 ${new Date(curso.fechaInicio).toLocaleDateString('es-ES')}</span>
                        <span>👥 ${curso.cupos} cupos</span>
                    </div>
                    <div class="curso-actions">
                        <button class="btn btn-small btn-primary" onclick="editarCurso(${curso.id})">✏️ Editar</button>
                        <button class="btn btn-small btn-danger" onclick="eliminarCurso(${curso.id})">🗑️ Eliminar</button>
                        ${inscritoId ? `
                            <button class="btn btn-small btn-outline" onclick="cancelarInscripcion(${inscritoId})">❌ Cancelar</button>
                        ` : `
                            <button class="btn btn-small btn-success" onclick="inscribirse(${curso.id})">Inscribirse</button>
                        `}
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.error(error);
        cursosContainer.innerHTML = '<p>Error al cargar cursos</p>';
    }
}

cursoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const esEdicion = Boolean(cursoEditandoId);
    // 🟢 URL dinámica corregida
    const url = esEdicion ? `${API_URL}/api/cursos/${cursoEditandoId}` : `${API_URL}/api/cursos`;

    try {
        const response = await fetch(url, {
            method: esEdicion ? 'PUT' : 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                nombre: document.getElementById('nombre').value,
                descripcion: document.getElementById('descripcion').value,
                cupos: document.getElementById('cupos').value,
                fechaInicio: document.getElementById('fechaInicio').value
            })
        });

        const dataRaw = await response.json();
        const msg = dataRaw.message || dataRaw.mensaje;

        if (response.ok) {
            mostrarNotificacion(msg || 'Éxito', 'success');
            cursoForm.reset();
            cancelarEdicion();
            cargarCursos();
        } else {
            mostrarNotificacion(msg || 'Error', 'error');
        }
    } catch (error) {
        mostrarNotificacion('Error en el servidor', 'error');
    }
});

async function eliminarCurso(id) {
    if (!confirm('¿Eliminar?')) return;
    try {
        // 🟢 URL corregida
        const response = await fetch(`${API_URL}/api/cursos/${id}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            mostrarNotificacion('Curso eliminado', 'success');
            cargarCursos();
        }
    } catch (error) {
        mostrarNotificacion('Error al eliminar', 'error');
    }
}

async function editarCurso(id) {
    try {
        // 🟢 URL corregida
        const response = await fetch(`${API_URL}/api/cursos/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        const curso = data.data?.curso || data.data || data;

        cursoEditandoId = curso.id;
        cursoIdInput.value = curso.id;
        document.getElementById('nombre').value = curso.nombre;
        document.getElementById('descripcion').value = curso.descripcion;
        document.getElementById('cupos').value = curso.cupos;
        document.getElementById('fechaInicio').value = String(curso.fechaInicio).split('T')[0];

        crearCursoBtn.textContent = 'Actualizar Curso';
        cancelarEdicionBtn.hidden = false;
    } catch (error) {
        mostrarNotificacion('Error al cargar edición', 'error');
    }
}

function cancelarEdicion() {
    cursoEditandoId = null;
    cursoIdInput.value = '';
    cursoForm.reset();
    crearCursoBtn.textContent = 'Crear Curso';
    cancelarEdicionBtn.hidden = true;
}

cancelarEdicionBtn.addEventListener('click', cancelarEdicion);

async function inscribirse(cursoId) {
    try {
        // 🟢 URL corregida
        const response = await fetch(`${API_URL}/api/inscripciones`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ cursoId })
        });
        if (response.ok) {
            mostrarNotificacion('Inscripción exitosa', 'success');
            cargarCursos();
        }
    } catch (error) {
        mostrarNotificacion('Error al inscribirse', 'error');
    }
}

async function cancelarInscripcion(inscripcionId) {
    try {
        // 🟢 URL corregida
        const response = await fetch(`${API_URL}/api/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });
        if (response.ok) {
            mostrarNotificacion('Inscripción cancelada', 'success');
            cargarCursos();
        }
    } catch (error) {
        mostrarNotificacion('Error al cancelar', 'error');
    }
}

window.eliminarCurso = eliminarCurso;
window.editarCurso = editarCurso;
window.inscribirse = inscribirse;
window.cancelarInscripcion = cancelarInscripcion;

cargarCursos();