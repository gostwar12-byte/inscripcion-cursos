const token = localStorage.getItem('token');

if (!token) {
    window.location.href = 'login.html';
}

const cursosContainer = document.getElementById('cursosContainer');
const logoutBtn = document.getElementById('logoutBtn');

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

cargarCursos();