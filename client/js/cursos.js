const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const cursosContainer = document.getElementById('cursosContainer');
const logoutBtn = document.getElementById('logoutBtn');
const cursoForm = document.getElementById('cursoForm');

logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('token');
    window.location.href = 'login.html';
});

async function cargarCursos() {

    try {

        const response = await fetch(
            'http://localhost:3000/api/cursos',
            {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            }
        );

        const cursos = await response.json();

        cursosContainer.innerHTML = '';

        cursos.forEach(curso => {

            cursosContainer.innerHTML += `
                <div>
                    <h3>${curso.nombre}</h3>
                    <p>${curso.descripcion}</p>
                    <p>Cupos: ${curso.cupos}</p>

                    <button onclick="eliminarCurso(${curso.id})">
                        Eliminar
                    </button>
                </div>
                <hr>
            `;
        });

    } catch (error) {

        console.error(error);

        cursosContainer.innerHTML =
            '<p>Error al cargar cursos</p>';
    }
}

cursoForm.addEventListener('submit', async (e) => {

    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const descripcion = document.getElementById('descripcion').value;
    const cupos = document.getElementById('cupos').value;
    const fechaInicio = document.getElementById('fechaInicio').value;

    try {

        const response = await fetch(
            'http://localhost:3000/api/cursos',
            {
                method: 'POST',
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

        const data = await response.json();

        alert(data.mensaje);

        cursoForm.reset();

        cargarCursos();

    } catch (error) {

        console.error(error);

        alert('Error al crear curso');
    }
});

async function eliminarCurso(id) {

    const confirmar = confirm(
        '¿Estás seguro de eliminar este curso?'
    );

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

        const data = await response.json();

        alert(data.mensaje);

        cargarCursos();

    } catch (error) {

        console.error(error);

        alert('Error al eliminar curso');
    }
}

window.eliminarCurso = eliminarCurso;

cargarCursos();