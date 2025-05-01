// app/dashboard/layout.js
"use client"; // Indica que este es un Componente de Cliente

import { useEffect, useState } from 'react'; // Para usar hooks de estado y efectos secundarios
import { useRouter, usePathname } from 'next/navigation'; // useRouter para redirigir, usePathname para obtener la ruta actual
import Link from 'next/link'; // Para enlaces de navegación dentro de la app


import { logout } from '@/app/services/apiService'; // Importa la función de logout desde tu servicio de autenticación

// Este Componente Layout envolverá a todos los componentes de página
// dentro del segmento de ruta /dashboard (ej: app/dashboard/page.js, app/dashboard/restaurantes/[slug]/ordenes/page.js)
export default function DashboardLayout({ children }) {
  // Estado para controlar si el usuario está autenticado
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  // Estado para controlar si la verificación de autenticación está en curso
  const [loadingAuth, setLoadingAuth] = useState(true);

  // Hooks de Next.js para la navegación y la ruta actual
  const router = useRouter();
  const pathname = usePathname(); // Obtiene la ruta actual (ej: '/dashboard', '/dashboard/login', '/dashboard/restaurantes/mi-restaurante/ordenes')

  // --- Efecto: Verificar Autenticación al Montar y al Cambiar de Ruta ---
  // Este efecto se ejecuta cuando el Layout se monta (carga inicial) y cada vez que la ruta (pathname) cambia.
  useEffect(() => {
    const checkAuth = () => {
      // Recuperar los tokens JWT de donde estén almacenados (ej: localStorage).
      // En una aplicación de producción, considera métodos de almacenamiento más seguros y validación de token (ej: verificar expiración o llamar a un endpoint backend /verify-token).
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');

      // Determinar si la ruta actual es específicamente la página de inicio de sesión.
      // Esto es crucial para evitar bucles infinitos de redirección: si un usuario no está autenticado y ya está en la página de login, no queremos intentar redirigirlo *de nuevo* a la misma página.
      const isLoginPage = pathname === '/dashboard/login';

      if (accessToken && refreshToken) {
        // Si se encuentran ambos tokens, consideramos que el usuario está autenticado para propósitos de enrutamiento.
        // (Repito: validar la expiración real del token es una mejora importante para un entorno de producción).
        setIsAuthenticated(true);
        setLoadingAuth(false); // La verificación ha terminado.

        // Si el usuario está autenticado PERO la ruta actual es la página de login,
        // lo redirigimos a la página principal del dashboard.
        if (isLoginPage) {
             console.log("Usuario autenticado y en la página de login. Redirigiendo al dashboard principal.");
             router.push('/dashboard'); // Redirige a la página principal del dashboard (app/dashboard/page.js)
        }

      } else {
        // No se encontraron tokens, el usuario no está autenticado.
        setIsAuthenticated(false);
        setLoadingAuth(false); // La verificación ha terminado.

        // Si el usuario NO está en la página de login Y NO está autenticado,
        // lo redirigimos a la página de inicio de sesión.
        if (!isLoginPage) {
          console.log("Autenticación requerida. Redirigiendo a login.");
          router.push('/dashboard/login'); // Redirige a la página de login (app/dashboard/login/page.js)
        }
        // Si el usuario no está autenticado Y ya está en la página de login, simplemente se queda ahí (no se hace redirección).
      }
    };

    // Ejecutar la función de verificación de autenticación. Se ejecutará al montar el Layout y en cada cambio de ruta.
    checkAuth();

    // Array de dependencias del useEffect. El efecto se re-ejecutará si router o pathname cambian.
  }, [router, pathname]); // Incluir pathname y router en las dependencias es necesario para que el efecto se dispare correctamente en cambios de ruta y para evitar advertencias del linter.


  // --- Función para Cerrar Sesión (Logout) ---
  // Esta función se llamará cuando el usuario haga clic en el botón "Cerrar Sesión" en el encabezado.
  const handleLogout = () => {
    // Llama a la función de logout de tu servicio de autenticación.
    // Esta función debe limpiar los tokens del almacenamiento (ej: localStorage).
    logout(); // <-- Debes implementar esta función en tu archivo src/services/authService.js
    setIsAuthenticated(false); // Actualizar el estado de autenticación en el layout inmediatamente.
    console.log("Cerrando sesión. Redirigiendo a login.");
    router.push('/dashboard/login'); // Redirigir al usuario a la página de login después de cerrar sesión.
  };


  // --- Lógica de Renderizado del Layout ---

  // Si la verificación de autenticación aún está en progreso (loadingAuth es true),
  // mostrar un indicador de carga en lugar del contenido real.
  // Esto evita que se muestre brevemente contenido protegido antes de que la redirección (si aplica) ocurra.
  if (loadingAuth) {
      // Puedes renderizar un spinner de carga a pantalla completa o un mensaje simple.
      return (
          <div className="flex items-center justify-center min-h-screen bg-gray-100"> {/* Contenedor para centrar vertical y horizontalmente */}
             <div className="text-center">
               {/* Spinner de carga básico con clases de Tailwind */}
               <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
               <p className="text-gray-700 text-lg">Verificando autenticación...</p> {/* Mensaje de carga */}
             </div>
          </div>
      );
  }

  // En este punto, loadingAuth es false, lo que significa que la verificación ha terminado.

  // Si el usuario NO está autenticado Y la ruta actual NO es la página de login,
  // el useEffect ya ha activado la redirección a /dashboard/login.
  // Podemos retornar null o un mensaje simple ("Redirigiendo...") mientras la redirección se completa.
  // Renderizar `children` aquí sería incorrecto ya que es una página protegida sin autenticación.
  if (!isAuthenticated && pathname !== '/dashboard/login') {
      // Este estado debería ser muy breve. Retornar null es una práctica común.
      return null; // O <div className="text-center mt-20">Redirigiendo al login...</div>
  }


  // Si el usuario SÍ está autenticado (isAuthenticated es true), O si la ruta actual ES la página de login (y isAuthenticated es false),
  // renderizamos la estructura común del layout y el `children` (el componente de la página actual).
  // Esto permite que la página de login se renderice para usuarios no autenticados, y las páginas protegidas se rendericen para usuarios autenticados.
  return (
    <div className="min-h-screen bg-gray-100"> {/* Aplica color de fondo al área del dashboard y asegura altura mínima */}
      {/* Encabezado del Dashboard (Opcional, pero común) */}
      {/* Solo mostrar el encabezado si el usuario ESTÁ autenticado */}
      {isAuthenticated && (
         <header className="bg-white shadow-sm"> {/* Estilos para el encabezado */}
           <div className="container mx-auto px-4 py-4 flex justify-between items-center"> {/* Layout del contenido del encabezado */}
             {/* Título del Sitio o Logo - Enlace a la página principal del dashboard */}
             <Link href="/dashboard" className="text-xl font-bold text-primary hover:text-primary/90">
               Panel de Gestión
             </Link>
             {/* Enlaces de Navegación (Opcional) */}
             <nav>
               <ul className="flex space-x-4 items-center">
                 {/* Puedes añadir otros enlaces de navegación principales aquí si los necesitas */}
                 {/* <li><Link href="/dashboard/settings" className="text-gray-700 hover:text-gray-900 hover:underline">Configuración</Link></li> */}
                 {/* Botón de Cerrar Sesión */}
                 <li>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 bg-red-600 text-white text-sm font-medium rounded-md hover:bg-red-700 transition duration-200"
                    >
                      Cerrar Sesión
                    </button>
                 </li>
               </ul>
             </nav>
           </div>
         </header>
      )}

      {/* Área de Contenido Principal */}
      {/* Aquí es donde se renderizará el componente de la página actual (ej: app/dashboard/page.js o app/dashboard/restaurantes/[slug]/ordenes/page.js) */}
      {/* Renderizamos `children` a menos que el layout esté en estado de carga o error/redirección explícita. */}
      <main className="container mx-auto px-4 py-8"> {/* Aplica padding al área de contenido principal */}
         {/* Renderiza el componente de página hijo */}
         {children}
      </main>

      {/* Pie de Página (Opcional) */}
      {/* <footer className="bg-gray-800 text-white text-center py-4 mt-8">
          <p>&copy; {new Date().getFullYear()} Mi Plataforma de Restaurantes</p>
      </footer> */}

    </div>
  );
}