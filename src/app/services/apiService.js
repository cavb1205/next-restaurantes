// Asegúrate de que esta URL base apunte a tu backend de Django
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`// <-- Cambia esto a la URL base de tu API

// Función para obtener el Access Token (podrías añadir lógica de refresh aquí después)
function getAccessToken() {
  // Recupera el token de donde lo hayas guardado (localStorage en el ejemplo de login)
  return localStorage.getItem('accessToken'); // <-- Asegúrate de que coincida con donde lo guardas
}

// Función para hacer peticiones autenticadas a tu API
export async function authenticatedRequest(method, endpoint, data = null) {
  const accessToken = getAccessToken();

  // **Verificación de Autenticación aquí:** Si no hay token, lanzamos un error específico.
  // El componente que llama a esta función debe capturar este error y redirigir al login.
  if (!accessToken) {
    const authError = new Error('No authentication token found.');
    authError.isAuthError = true; // Marcador personalizado para identificar errores de autenticación
    throw authError;
  }

  // Configurar las cabeceras, incluyendo la de autorización JWT
  const headers = {
    'Authorization': `Bearer ${accessToken}`, // <-- Añadir el Access Token JWT con prefijo "Bearer "
    'Content-Type': 'application/json', // Por defecto, enviamos JSON
  };

  // Configuración de la petición fetch
  const config = {
    method: method.toUpperCase(), // Método HTTP (GET, POST, PUT, PATCH, DELETE)
    headers: headers,
  };

  // Si hay datos para enviar (para POST, PUT, PATCH), añadirlos al cuerpo
  if (data !== null) { // Usamos !== null para permitir enviar 'false', 0, '' si es necesario
    config.body = JSON.stringify(data);
  }

  // Construir la URL completa
  const url = `${API_BASE_URL}${endpoint}`;

  // Realizar la petición fetch
  const response = await fetch(url, config);

  // --- Manejo de Errores HTTP ---

  // Manejar específicamente el error 401 Unauthorized (token expirado o inválido)
  // Aquí es donde usualmente intentarías refrescar el token ANTES de redirigir al login.
  // Por simplicidad ahora, solo lanzaremos un error de autenticación.
  if (response.status === 401) {
      const authError = new Error('Authentication expired or invalid.');
      authError.isAuthError = true;
      authError.response = response; // Adjuntar respuesta para inspección si es necesario
      throw authError; // Lanzar para que el componente redirija
  }

  // Manejar otros errores HTTP (400, 403, 404, 500, etc.)
  if (!response.ok) {
    // Intentar leer el cuerpo de la respuesta para obtener detalles del error del backend
    const errorData = await response.json().catch(() => ({})); // Capturar si no se puede parsear JSON
    const error = new Error(errorData.detail || `Error HTTP! status: ${response.status}`);
    error.response = { status: response.status, data: errorData }; // Adjuntar info de la respuesta
    throw error; // Lanzar el error
  }

  // Si la respuesta fue exitosa (2xx)
  // Devolver datos JSON para respuestas que tienen cuerpo (no 204 No Content)
  if (response.status !== 204) {
      return await response.json();
  }
  // Para 204 No Content (ej: DELETE exitoso), no hay cuerpo, retornamos null o un indicador de éxito
  return null; // O { success: true, status: 204 }

}

// --- Funciones específicas de servicio para las APIs que creamos ---

// Para obtener la lista de restaurantes del usuario autenticado
export async function getMyRestaurants() {
    // Llama a authenticatedRequest con el método GET y el endpoint correcto
    return authenticatedRequest('GET', '/mis-restaurantes/'); // <-- Asegúrate que el endpoint coincida con tu urls.py
}

// Para obtener el resumen del panel de control de un restaurante específico
export async function getRestaurantDashboardSummary(restauranteSlug) {
    // Llama a authenticatedRequest con GET y el endpoint que creamos, pasando el slug
    return authenticatedRequest('GET', `/restaurantes/${restauranteSlug}/dashboard/summary/`); // <-- Asegúrate que el endpoint coincida
}

export async function logout () {
  // Aquí puedes implementar la lógica de logout, como eliminar el token del localStorage
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  
    window.location.href = 'dashboard/login'; // Cambia esto a la ruta de tu página de login
}

export async function getRestaurantOrders(restauranteSlug) {
  if (!restauranteSlug) {
      throw new Error("Restaurant slug is required to fetch orders.");
  }
  // Llama a authenticatedRequest con GET y el endpoint para obtener órdenes por slug
  return authenticatedRequest('GET', `/restaurantes/${restauranteSlug}/ordenes/`); // <-- Endpoint que esperas en tu backend
}


export async function getOrderDetail(restauranteSlug, orderId) {
  console.log(`[getOrderDetail] Starting for slug ${restauranteSlug}, orderId ${orderId}...`); // Log de inicio
  // Verifica que ambos parámetros sean válidos
  if (!restauranteSlug || !orderId) {
       console.error("[getOrderDetail] Missing slug or orderId!"); // Log si falta algún parámetro
      throw new Error("Restaurant slug and Order ID are required to fetch order details.");
  }
  // Llama a authenticatedRequest con el método GET y el endpoint correcto para el detalle de una orden
   console.log(`[getOrderDetail] Calling authenticatedRequest GET /restaurantes/${restauranteSlug}/ordenes/${orderId}/`); // Log antes de llamar a authenticatedRequest
  // **<<-- Asegúrate que este endpoint '/restaurantes/${restauranteSlug}/ordenes/${orderId}/' coincida exactamente con tu urls.py de Django -->>**
  return authenticatedRequest('GET', `/restaurantes/${restauranteSlug}/ordenes/${orderId}/`);
}


export async function updateOrderStatus(restauranteSlug, orderId, newStatus) {
  console.log(`[updateOrderStatus] Starting for slug ${restauranteSlug}, orderId ${orderId}, newStatus ${newStatus}...`); // Log de inicio
  if (!restauranteSlug || !orderId || !newStatus) {
      console.error("[updateOrderStatus] Missing slug, orderId, or newStatus!"); // Log si falta algo
      throw new Error("Restaurant slug, Order ID, and new status are required to update order status.");
  }

  // Define los datos a enviar en el cuerpo de la petición (solo el campo 'estado')
  const data = {
      estado: newStatus
  };

   console.log(`[updateOrderStatus] Calling authenticatedRequest PATCH /restaurantes/<span class="math-inline">\{restauranteSlug\}/ordenes/</span>{orderId}/ with data:`, data); // Log antes de llamar a authenticatedRequest
  // Llama a authenticatedRequest con el método PATCH y el endpoint de detalle de orden, enviando los datos.
  // Asumimos que authenticatedRequest maneja el JSON.stringify y las cabeceras.
  return authenticatedRequest('PATCH', `/restaurantes/${restauranteSlug}/ordenes/${orderId}/estado/`, data);
}