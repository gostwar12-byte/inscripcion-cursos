const loginForm = document.getElementById('loginForm');
const mensaje = document.getElementById('mensaje');

// REEMPLAZA ESTA URL POR LA DE TU BACKEND EN RAILWAY
const API_URL = 'https://TU-URL-DE-RAILWAY.up.railway.app';

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch(
            `${API_URL}/api/auth/login`,
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

        const textoMensaje = data.mensaje || data.data?.mensaje;

        if (!response.ok) {
            mensaje.className = 'message-box error';
            mensaje.textContent = '✗ ' + (textoMensaje || 'Credenciales incorrectas');
            return;
        }

        const token = data.data?.token || data.token;
        localStorage.setItem('token', token);

        mensaje.className = 'message-box success';
        mensaje.textContent = '✓ ' + (textoMensaje || '¡Logeo exitoso!');

        setTimeout(() => {
            window.location.href = 'dashboard.html';
        }, 1500);

    } catch (error) {
        console.error(error);
        mensaje.className = 'message-box error';
        mensaje.textContent = '✗ Error al conectar con el servidor';
    }
});