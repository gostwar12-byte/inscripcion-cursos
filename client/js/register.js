const registerForm = document.getElementById('registerForm');
const mensaje = document.getElementById('mensaje');

registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const nombre = document.getElementById('nombre').value;
    const correo = document.getElementById('correo').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    // Validar que las contraseñas coincidan
    if (password !== passwordConfirm) {
        mensaje.className = 'message-box error';
        mensaje.textContent = '✗ Las contraseñas no coinciden';
        return;
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
        mensaje.className = 'message-box error';
        mensaje.textContent = '✗ La contraseña debe tener mínimo 6 caracteres';
        return;
    }

    try {

        const response = await fetch(
            'http://localhost:3000/api/auth/register',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    nombre,
                    correo,
                    password
                })
            }
        );

        const data = await response.json();

        if (!response.ok) {
            mensaje.className = 'message-box error';
            mensaje.textContent = '✗ ' + data.mensaje;
            return;
        }

        mensaje.className = 'message-box success';
        mensaje.textContent = '✓ Cuenta creada correctamente. Redirigiendo a login...';

        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);

    } catch (error) {
        console.error(error);

        mensaje.className = 'message-box error';
        mensaje.textContent = '✗ Error al conectar con el servidor';
    }
});
