document.addEventListener('DOMContentLoaded', () => {
    // 🟢 CORRECCIÓN: URL de tu servidor en Railway
    const API_URL = 'https://inscripcion-cursos-production-bd3c.up.railway.app/api/auth';

    // Elementos de la interfaz
    const stepSolicitar = document.getElementById('step-solicitar');
    const stepRestablecer = document.getElementById('step-restablecer');
    const formSolicitar = document.getElementById('form-solicitar');
    const formRestablecer = document.getElementById('form-restablecer');
    const alertContainer = document.getElementById('alert-container');

    // Función auxiliar para mostrar alertas en pantalla
    const showAlert = (message, type = 'danger') => {
        alertContainer.className = `alert alert-${type} text-center`;
        alertContainer.textContent = message;
        alertContainer.classList.remove('d-none');
    };

    // FASE 1: Enviar solicitud de recuperación
    formSolicitar.addEventListener('submit', async (e) => {
        e.preventDefault();
        const correo = document.getElementById('email').value;

        try {
            const response = await fetch(`${API_URL}/request-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Código de recuperación enviado. Revisa tu consola/correo.', 'success');
                stepSolicitar.classList.add('d-none');
                stepRestablecer.classList.remove('d-none');
            } else {
                showAlert(data.message || 'Error al solicitar la recuperación.');
            }
        } catch (error) {
            console.error(error);
            showAlert('No se pudo conectar con el servidor.');
        }
    });

    // FASE 2: Enviar el token y la nueva contraseña
    formRestablecer.addEventListener('submit', async (e) => {
        e.preventDefault();
        const token = document.getElementById('token').value;
        const password = document.getElementById('nueva-password').value;

        try {
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('¡Contraseña actualizada con éxito! Redirigiendo al login...', 'success');
                setTimeout(() => {
                    window.location.href = 'login.html';
                }, 2500);
            } else {
                showAlert(data.message || 'El token es inválido o ya expiró.');
            }
        } catch (error) {
            console.error(error);
            showAlert('No se pudo conectar con el servidor.');
        }
    });
});