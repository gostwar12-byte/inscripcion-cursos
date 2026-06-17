document.addEventListener('DOMContentLoaded', () => {
    // URL base de tu API (Cámbiala por tu URL de Railway si estás probando en producción)
    const API_URL = 'http://localhost:3000/api/auth';

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
            // Nota de pauta: Endpoint para solicitar el token
            const response = await fetch(`${API_URL}/request-reset`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('Código de recuperación enviado. Revisa tu consola/correo.', 'success');
                // Ocultamos el paso 1 y mostramos el paso 2
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
            // Nota de pauta: Endpoint para aplicar el cambio sin enviar texto plano
            const response = await fetch(`${API_URL}/reset-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            });

            const data = await response.json();

            if (response.ok) {
                showAlert('¡Contraseña actualizada con éxito! Redirigiendo al login...', 'success');
                // Esperamos 2 segundos para que lea el mensaje y redirigimos
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