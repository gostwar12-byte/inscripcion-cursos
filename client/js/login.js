const loginForm = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    try {

        const response = await fetch(
            'http://localhost:3000/api/auth/login',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    correo,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            mensaje.textContent = data.mensaje;
            return;
        }

        localStorage.setItem('token', data.token);

        mensaje.textContent = 'Login exitoso';

        setTimeout(() => {
            window.location.href = 'cursos.html';
        }, 1000);

    } catch (error) {
        console.error(error);

        mensaje.textContent = 'Error al conectar con el servidor';
    }
});