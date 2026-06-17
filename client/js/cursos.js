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

// 🟢 CAPTURAMOS EL INTERRUPTOR DE FILTRADO DEL HTML (rq-07)
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

// 🟢 ESCUCHAR CUANDO EL USUARIO ACTIVA/DESACTIVA EL FILTRO (rq-07)
if (filtroDisponibles) {
    filtroDisponibles.addEventListener('change', () => {
        cargarCursos(); // Volvemos a pedir los datos aplicando el estado actual del checkbox
    });
}

async function cargarCursos() {
    try {
        // 🟢 SOLUCIÓN rq-07: Evaluamos de forma dinámica si el interruptor está marcado para armar la URL
        const soloDisponibles = filtroDisponibles ? filtroDisponibles.checked : false;
        const urlCursos = soloDisponibles 
            ? 'http://localhost:3000/api/cursos?disponibles=true' 
            : 'http://localhost:3000/api/cursos';

        // 1. Traer cursos usando la URL dinámica filtrada o completa
        const response = await fetch(urlCursos, {
            headers: { Authorization: `Bearer ${token}` }
        });
        const cursosRaw = await response.json();
        
        // Extrae el array de cursos si viene envuelto en .data o .data.cursos
        const cursos = cursosRaw.data?.cursos || cursosRaw.data || cursosRaw;

        // 2. Traer inscripciones del usuario para marcar cursos inscritos
        const insResp = await fetch('http://localhost:3000/api/inscripciones/mis-inscripciones', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const insRaw = insResp.ok ? await insResp.json() : { data: [] };
        
        // Extrae el array de inscripciones de manera segura
        const misInscripciones = insRaw.data?.inscripciones || insRaw.data || insRaw;

        // Creamos el mapa para verificar estados de inscripción
        const mapInscripciones = new Map();
        if (Array.isArray(misInscripciones)) {
            misInscripciones.forEach(i => mapInscripciones.set(i.cursoId, i.id));
        }

        cursosContainer.innerHTML = '';

        // Validamos que 'cursos' sea realmente un arreglo antes de recorrerlo
        if (!Array.isArray(cursos)) {
            cursosContainer.innerHTML = '<p class="text-muted">No se encontraron cursos o el formato es incorrecto.</p>';
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

                    <div class="curso-actions" style="display: flex; gap: 0.5rem; flex-wrap: wrap; align-items: center;">
                        <button class="btn btn-small btn-primary" onclick="editarCurso(${curso.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="eliminarCurso(${curso.id})">
                            🗑️ Eliminar
                        </button>
                        ${inscritoId ? `
                            <button class="btn btn-small btn-outline" style="padding: 0.25rem 0.6rem; white-space: nowrap;" onclick="cancelarInscripcion(${inscritoId})">
                                ❌ Cancelar Inscripción
                            </button>
                        ` : `
                            <button class="btn btn-small btn-success" onclick="inscribirse(${curso.id})">
                                Inscribirse
                            </button>
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

    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const cupos = document.getElementById('cupos').value;
    const fechaInicio = document.getElementById('fechaInicio').value;
    const esEdicion = Boolean(cursoEditandoId);
    const url = esEdicion
        ? `http://localhost:3000/api/cursos/${cursoEditandoId}`
        : 'http://localhost:3000/api/cursos';

    try {
        const response = await fetch(
            url,
            {
                method: esEdicion ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    nombre,
                    descripcion,
                    cupos,
                    fechaInicio
                })
            }
        );

        const dataRaw = await response.json();
        
        // 🟢 BUSQUEDA FLEXIBLE DEL MENSAJE (Evita caer en textos por defecto erróneos)
        const msg = dataRaw.message || dataRaw.mensaje || dataRaw.data?.message || dataRaw.data?.mensaje;

        if (response.ok) {
            mostrarNotificacion(msg || 'Operación realizada con éxito', 'success');
            cursoForm.reset();
            cancelarEdicion();
            cargarCursos();
        } else {
            mostrarNotificacion(msg || 'Error al crear/actualizar curso', 'error');
        }

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al crear/actualizar curso', 'error');
    }
});

async function eliminarCurso(id) {
    const confirmar = confirm('¿Estás seguro de eliminar este curso?');

    if (!confirmar) {
        return;
    }

    try {
        const response = await fetch(
            `http://localhost:3000/api/cursos/${id}`,
            {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const dataRaw = await response.json();
        const msg = dataRaw.message || dataRaw.mensaje || dataRaw.data?.message || dataRaw.data?.mensaje;

        if (response.ok) {
            mostrarNotificacion(msg || 'Curso eliminado correctamente', 'success');
            cargarCursos();
        } else {
            mostrarNotificacion(msg || 'Error al eliminar curso', 'error');
        }

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al eliminar curso', 'error');
    }
}

async function editarCurso(id) {
    try {
        const response = await fetch(
            `http://localhost:3000/api/cursos/${id}`,
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const cursoRaw = await response.json();
        const msg = cursoRaw.message || cursoRaw.mensaje || cursoRaw.data?.message || cursoRaw.data?.mensaje;

        if (!response.ok) {
            mostrarNotificacion(msg || 'No se pudo cargar el curso', 'error');
            return;
        }

        const curso = cursoRaw.data?.curso || cursoRaw.data || cursoRaw;

        cursoEditandoId = curso.id || id;
        cursoIdInput.value = curso.id || id;
        document.getElementById('nombre').value = curso.nombre || '';
        document.getElementById('descripcion').value = curso.descripcion || '';
        document.getElementById('cupos').value = curso.cupos ?? 0;
        
        document.getElementById('fechaInicio').value = curso.fechaInicio
            ? String(curso.fechaInicio).split('T')[0]
            : '';

        crearCursoBtn.textContent = 'Actualizar Curso';
        cancelarEdicionBtn.hidden = false;

        window.scrollTo({ top: 0, behavior: 'smooth' });

    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cargar curso para edición', 'error');
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

window.eliminarCurso = eliminarCurso;
window.editarCurso = editarCurso;

async function inscribirse(cursoId) {
    try {
        const response = await fetch('http://localhost:3000/api/inscripciones', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ cursoId })
        });

        const dataRaw = await response.json();
        
        // 🟢 CORRECCIÓN CLAVE: Extraemos el mensaje real (.message) enviado desde el backend en el error 400
        const msg = dataRaw.message || dataRaw.mensaje || dataRaw.data?.message || dataRaw.data?.mensaje;

        if (response.ok) {
            mostrarNotificacion(msg || 'Inscripción realizada con éxito', 'success');
            cargarCursos();
        } else {
            // Si el backend da error (ej: solapamiento), inyectará el texto descriptivo real con la cruz roja
            mostrarNotificacion(msg || 'Error al procesar la inscripción', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al inscribirse', 'error');
    }
}

async function cancelarInscripcion(inscripcionId) {
    try {
        const response = await fetch(`http://localhost:3000/api/inscripciones/${inscripcionId}`, {
            method: 'DELETE',
            headers: { Authorization: `Bearer ${token}` }
        });

        const dataRaw = await response.json();
        const msg = dataRaw.message || dataRaw.mensaje || dataRaw.data?.message || dataRaw.data?.mensaje;

        if (response.ok) {
            mostrarNotificacion(msg || 'Inscripción cancelada', 'success');
            cargarCursos();
        } else {
            mostrarNotificacion(msg || 'Error al cancelar inscripción', 'error');
        }
    } catch (error) {
        console.error(error);
        mostrarNotificacion('Error al cancelar inscripción', 'error');
    }
}

window.inscribirse = inscribirse;
window.cancelarInscripcion = cancelarInscripcion;

// Cargar listado inicial
cargarCursos();