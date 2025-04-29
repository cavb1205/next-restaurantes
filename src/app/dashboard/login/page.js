// app/dashboard/login/page.js
"use client"; 

import { useState } from 'react'; // Para manejar el estado del formulario
import { useRouter } from 'next/navigation'; // Para redirigir después del login


// que contenga una función `login`
import { login } from '@/services/authService'; // Importa la función de login de tu servicio API


export default function LoginPage() {
  // Estados para los campos del formulario
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  // Estado para manejar errores de login
  const [error, setError] = useState(null);
  // Estado para indicar si la petición está en curso
  const [loading, setLoading] = useState(false);

  // Hook del router para navegación programática
  const router = useRouter();

  // Función que maneja el envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevenir el comportamiento por defecto del formulario (recarga de página)

    // Resetear estados antes de la nueva petición
    setLoading(true);
    setError(null);

    try {
      // Llama a la función de login en tu servicio de API
      // Esta función debe hacer una petición POST a tu endpoint /api/token/
      const data = await login(username, password);

      // Verifica si la respuesta contiene los tokens esperados
      if (data && data.access && data.refresh) {
        // Si el login es exitoso, guarda los tokens.
        // Usamos localStorage por simplicidad en este ejemplo,
        // pero considera opciones más seguras y específicas para producción.
        localStorage.setItem('accessToken', data.access);
        localStorage.setItem('refreshToken', data.refresh);

        // Opcional: Puedes guardar información del usuario si tu endpoint de login la devuelve
        // localStorage.setItem('user', JSON.stringify(data.user));

        // Redirige al usuario al área de gestión (ej: el panel de control)
        router.push('/dashboard'); // Ajusta esta ruta a la URL real de tu panel
      } else {
         // Manejar casos donde la API respondió 200 pero sin tokens (inesperado)
         setError('Inicio de sesión fallido: Respuesta inválida del servidor.');
         console.error('Inicio de sesión fallido: Formato de respuesta inesperado', data);
      }

    } catch (err) {
      // Manejar errores de la petición API (ej: 401 Invalid credentials, errores de red)
      console.error('Error en el inicio de sesión:', err);

      // Mostrar un mensaje de error amigable para el usuario
      // Asumimos que el backend devuelve el detalle del error en err.response.data.detail para 401
      if (err.response && err.response.data && err.response.data.detail) {
         setError(err.response.data.detail);
      } else {
         // Mensaje genérico para otros tipos de errores (red, etc.)
         setError('Error en el inicio de sesión. Por favor, verifica tu usuario y contraseña o inténtalo de nuevo.');
      }
    } finally {
      // Finalizar el estado de carga
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100"> {/* Contenedor centrado */}
      <div className="w-full max-w-md px-8 py-6 mt-4 text-left bg-white shadow-lg rounded-lg"> {/* Tarjeta de login */}
        <h3 className="text-2xl font-bold text-center text-gray-800">Inicio de Sesión de Propietario</h3>
        <form onSubmit={handleSubmit} className="mt-4">
          {/* Mostrar errores si existen */}
          {error && (
            <div className="mb-4 text-sm text-red-700 bg-red-100 border border-red-400 rounded p-3">
              {error}
            </div>
          )}
          {/* Campo de Usuario */}
          <div className="mt-4">
            <label className="block text-gray-700" htmlFor="username">Usuario</label>
            <input
              type="text"
              placeholder="Nombre de usuario"
              id="username"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required // Campo obligatorio
            />
          </div>
          {/* Campo de Contraseña */}
          <div className="mt-4">
            <label className="block text-gray-700" htmlFor="password">Contraseña</label>
            <input
              type="password"
              placeholder="Contraseña"
              id="password"
              className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-primary"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required // Campo obligatorio
            />
          </div>
          {/* Botón de Submit */}
          <div className="flex items-baseline justify-between">
            <button
              type="submit"
              className="px-6 py-2 mt-4 text-white bg-primary rounded-lg hover:bg-primary/90 disabled:opacity-50"
              disabled={loading} // Deshabilita el botón durante la carga
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'} {/* Texto cambia durante carga */}
            </button>
            {/* Opcional: Enlace a restablecer contraseña si tienes esa funcionalidad */}
            {/* <Link href="/dashboard/forgot-password" className="text-sm text-primary hover:underline">
              Olvidaste tu contraseña?
            </Link> */}
          </div>
        </form>
      </div>
    </div>
  );
}