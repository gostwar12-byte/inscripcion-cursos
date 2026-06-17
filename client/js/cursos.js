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

async function cargarCursos() {
    try {
        // 1. Traer cursos
        const response = await fetch('http://localhost:3000/api/cursos', {
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
        const misInscripciones = insRaw.data || insRaw;

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

                    <div class="curso-actions">
                        <button class="btn btn-small btn-primary" onclick="editarCurso(${curso.id})">
                            ✏️ Editar
                        </button>
                        <button class="btn btn-small btn-danger" onclick="eliminarCurso(${curso.id})">
                            🗑️ Eliminar
                        </button>
                        ${inscritoId ? `
                            <button class="btn btn-small btn-outline" onclick="cancelarInscripcion(${inscritoId})">Cancelar inscripción</button>
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
        // 🟢 SOLUCIÓN: Buscar el mensaje de éxito en la raíz o dentro de .data
        const msg = dataRaw.mensaje || dataRaw.data?.mensaje || 'Operación realizada con éxito';

        if (response.ok) {
            mostrarNotificacion(msg, 'success');
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
        // 🟢 SOLUCIÓN: Buscar mensaje en raíz o en .data
        const msg = dataRaw.mensaje || dataRaw.data?.mensaje || 'Curso eliminado correctamente';

        if (response.ok) {
            mostrarNotificacion(msg, 'success');
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

        if (!response.ok) {
            mostrarNotificacion(cursoRaw.mensaje || cursoRaw.data?.mensaje || 'No se pudo cargar el curso', 'error');
            return;
        }

        // 🟢 SOLUCIÓN: Extraemos el curso validando si viene en raíz, en .data o en .data.curso
        const curso = cursoRaw.data?.curso || cursoRaw.data || cursoRaw;

        // Rellenamos el formulario buscando propiedades alternativas por si acaso
        cursoEditandoId = curso.id || id;
        cursoIdInput.value = curso.id || id;
        document.getElementById('nombre').value = curso.nombre || '';
        document.getElementById('descripcion').value = curso.descripcion || '';
        document.getElementById('cupos').value = curso.cupos ?? 0;
        
        document.getElementById('fechaInicio').value = curso.fechaInicio
            ? String(curso.fechaInicio).split('T')[0]
            : '';

        // Cambiamos el texto del botón principal para indicar edición
        crearCursoBtn.textContent = 'Actualizar Curso';
        cancelarEdicionBtn.hidden = false;

        // Scroll suave hacia arriba
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
        // 🟢 SOLUCIÓN: Buscar mensaje en raíz o en .data
        const msg = dataRaw.mensaje || dataRaw.data?.mensaje || 'Inscripción realizada con éxito';

        if (response.ok) {
            mostrarNotificacion(msg, 'success');
            cargarCursos();
        } else {
            mostrarNotificacion(msg || 'Error al inscribirse', 'error');
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
        // 🟢 SOLUCIÓN: Buscar mensaje en raíz o en .data
        const msg = dataRaw.mensaje || dataRaw.data?.mensaje || 'Inscripción cancelada';

        if (response.ok) {
            mostrarNotificacion(msg, 'success');
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