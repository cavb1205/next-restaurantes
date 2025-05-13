import { redirect } from "next/navigation";

// Asegúrate de que esta URL base apunte a tu backend de Django
const API_BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api`; // <-- Cambia esto a la URL base de tu API

// Función para obtener el Access Token (podrías añadir lógica de refresh aquí después)
function getAccessToken() {
  // Recupera el token de donde lo hayas guardado (localStorage en el ejemplo de login)
  return localStorage.getItem("accessToken"); // <-- Asegúrate de que coincida con donde lo guardas
}

// Función para hacer peticiones autenticadas a tu API
export async function authenticatedRequest(method, endpoint, data = null) {
  const accessToken = getAccessToken();

  // **Verificación de Autenticación aquí:** Si no hay token, lanzamos un error específico.
  // El componente que llama a esta función debe capturar este error y redirigir al login.
  if (!accessToken) {
    const authError = new Error("No authentication token found.");
    authError.isAuthError = true; // Marcador personalizado para identificar errores de autenticación
    throw authError;
  }

  // Configurar las cabeceras, incluyendo la de autorización JWT
  const headers = {
    Authorization: `Bearer ${accessToken}`, // <-- Añadir el Access Token JWT con prefijo "Bearer "
    // 'Content-Type': 'application/json', // Por defecto, enviamos JSON
  };

  // Configuración de la petición fetch
  const config = {
    method: method.toUpperCase(), // Método HTTP (GET, POST, PUT, PATCH, DELETE)
    headers: headers,
  };

  // Si hay datos para enviar (para POST, PUT, PATCH), añadirlos al cuerpo
  if (data !== null) {
    if (data instanceof FormData) {
      console.log("[authenticatedRequest] Sending FormData.");
      config.body = data;
    } else {
      // Si los datos NO son FormData, asumimos que es JSON.
      console.log("[authenticatedRequest] Sending JSON data.");
      config.headers["Content-Type"] = "application/json"; // Añade Content-Type solo para JSON
      config.body = JSON.stringify(data);
    }
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
    localStorage.removeItem("accessToken"); // Limpiar el token expirado
    localStorage.removeItem("refreshToken"); // Limpiar el refresh token si lo tienes
    redirect("/dashboard/login"); // Redirigir al login
    const authError = new Error("Authentication expired or invalid.");
    authError.isAuthError = true;
    authError.response = response; // Adjuntar respuesta para inspección si es necesario
    throw authError; // Lanzar para que el componente redirija
  }

  // Manejar otros errores HTTP (400, 403, 404, 500, etc.)
  if (!response.ok) {
    // Intentar leer el cuerpo de la respuesta para obtener detalles del error del backend
    const errorData = await response.json().catch(() => ({})); // Capturar si no se puede parsear JSON
    const error = new Error(
      errorData.detail || `Error HTTP! status: ${response.status}`
    );
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
  return authenticatedRequest("GET", "/mis-restaurantes/"); // <-- Asegúrate que el endpoint coincida con tu urls.py
}

// Para obtener el resumen del panel de control de un restaurante específico
export async function getRestaurantDashboardSummary(restauranteSlug) {
  // Llama a authenticatedRequest con GET y el endpoint que creamos, pasando el slug
  return authenticatedRequest(
    "GET",
    `/restaurantes/${restauranteSlug}/dashboard/summary/`
  ); // <-- Asegúrate que el endpoint coincida
}

export async function logout() {
  // Aquí puedes implementar la lógica de logout, como eliminar el token del localStorage
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");

  window.location.href = "dashboard/login"; // Cambia esto a la ruta de tu página de login
}

export async function getRestaurantOrders(restauranteSlug) {
  if (!restauranteSlug) {
    throw new Error("Restaurant slug is required to fetch orders.");
  }
  // Llama a authenticatedRequest con GET y el endpoint para obtener órdenes por slug
  return authenticatedRequest(
    "GET",
    `/restaurantes/${restauranteSlug}/ordenes/`
  ); // <-- Endpoint que esperas en tu backend
}

export async function getOrderDetail(restauranteSlug, orderId) {
  console.log(
    `[getOrderDetail] Starting for slug ${restauranteSlug}, orderId ${orderId}...`
  ); // Log de inicio
  // Verifica que ambos parámetros sean válidos
  if (!restauranteSlug || !orderId) {
    console.error("[getOrderDetail] Missing slug or orderId!"); // Log si falta algún parámetro
    throw new Error(
      "Restaurant slug and Order ID are required to fetch order details."
    );
  }
  // Llama a authenticatedRequest con el método GET y el endpoint correcto para el detalle de una orden
  console.log(
    `[getOrderDetail] Calling authenticatedRequest GET /restaurantes/${restauranteSlug}/ordenes/${orderId}/`
  ); // Log antes de llamar a authenticatedRequest
  // **<<-- Asegúrate que este endpoint '/restaurantes/${restauranteSlug}/ordenes/${orderId}/' coincida exactamente con tu urls.py de Django -->>**
  return authenticatedRequest(
    "GET",
    `/restaurantes/${restauranteSlug}/ordenes/${orderId}/`
  );
}

export async function updateOrderStatus(restauranteSlug, orderId, newStatus) {
  console.log(
    `[updateOrderStatus] Starting for slug ${restauranteSlug}, orderId ${orderId}, newStatus ${newStatus}...`
  ); // Log de inicio
  if (!restauranteSlug || !orderId || !newStatus) {
    console.error("[updateOrderStatus] Missing slug, orderId, or newStatus!"); // Log si falta algo
    throw new Error(
      "Restaurant slug, Order ID, and new status are required to update order status."
    );
  }

  // Define los datos a enviar en el cuerpo de la petición (solo el campo 'estado')
  const data = {
    estado: newStatus,
  };

  console.log(
    `[updateOrderStatus] Calling authenticatedRequest PATCH /restaurantes/<span class="math-inline">\{restauranteSlug\}/ordenes/</span>{orderId}/ with data:`,
    data
  ); // Log antes de llamar a authenticatedRequest
  // Llama a authenticatedRequest con el método PATCH y el endpoint de detalle de orden, enviando los datos.
  // Asumimos que authenticatedRequest maneja el JSON.stringify y las cabeceras.
  return authenticatedRequest(
    "PATCH",
    `/restaurantes/${restauranteSlug}/ordenes/${orderId}/estado/`,
    data
  );
}

export async function getRestaurantMenu(restauranteSlug) {
  console.log(`[getRestaurantMenu] Starting for slug ${restauranteSlug}...`); // Log de inicio
  if (!restauranteSlug) {
    console.error("[getRestaurantMenu] Slug is null or undefined!"); // Log si falta slug
    throw new Error("Restaurant slug is required to fetch menu.");
  }
  // Llama a authenticatedRequest con GET y el endpoint para el menú por slug
  console.log(
    `[getRestaurantMenu] Calling authenticatedRequest GET /restaurantes/${restauranteSlug}/menu/`
  ); // Log antes de llamar a authenticatedRequest
  // **<<-- Asegúrate que este endpoint '/restaurantes/${restauranteSlug}/menu/' coincida exactamente con tu urls.py de Django -->>**
  return authenticatedRequest("GET", `/restaurantes/${restauranteSlug}/menu/`);
}

export async function getCategories(restauranteSlug) {
  console.log("[getCategories] Starting..."); // Log de inicio
  const endpoint = `/restaurantes/${restauranteSlug}/categorias/`;
  console.log(`[getCategories] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest("GET", endpoint);
}

// --- Nueva función para CREAR un Producto ---
// Usará el método POST al endpoint de lista de menú del restaurante.
export async function createProduct(restauranteSlug, productData) {
  console.log("=== createProduct Debug ===");
  console.log("restauranteSlug:", restauranteSlug);
  console.log("productData:", JSON.stringify(productData, null, 2));

  if (!restauranteSlug || !productData) {
    console.error("[createProduct] Missing slug or productData!");
    console.error("restauranteSlug:", restauranteSlug);
    console.error("productData:", productData);
    throw new Error(
      "Restaurant slug and product data are required to create a product."
    );
  }

  const endpoint = `/restaurantes/${restauranteSlug}/menu/`;
  console.log(`[createProduct] Endpoint construido:`, endpoint);
  console.log(
    `[createProduct] Datos a enviar:`,
    JSON.stringify(productData, null, 2)
  );

  try {
    const response = await authenticatedRequest("POST", endpoint, productData);
    console.log("[createProduct] Respuesta exitosa:", response);
    return response;
  } catch (error) {
    console.error("[createProduct] Error en la petición:", error);
    throw error;
  }
}

// --- Nueva función para OBTENER los detalles de UN Producto ---
export async function getProductDetail(restauranteSlug, productId) {
  console.log(`[getProductDetail] Starting for slug ${restauranteSlug}, productId ${productId}...`); // Log de inicio
  if (!restauranteSlug || !productId) {
       console.error("[getProductDetail] Missing slug or productId!"); // Log si falta algún parámetro
      throw new Error("Restaurant slug and Product ID are required to fetch product details.");
  }
  // Llama a authenticatedRequest con GET al endpoint de detalle de producto
   console.log(`[getProductDetail] Calling authenticatedRequest GET /restaurantes/${restauranteSlug}/menu/${productId}/`); // Log antes de llamar a authenticatedRequest
  // **<<-- Asegúrate que este endpoint '/restaurantes/${restauranteSlug}/menu/${productId}/' coincida exactamente con tu urls.py -->>**
  return authenticatedRequest('GET', `/restaurantes/${restauranteSlug}/menu/${productId}/`);
}

// --- Nueva función para ACTUALIZAR un Producto (PATCH) ---
export async function updateProduct(restauranteSlug, productId, productData) {
  console.log(`[updateProduct] Starting for slug ${restauranteSlug}, productId ${productId} with data:`, productData); // Log de inicio
   if (!restauranteSlug || !productId || !productData) {
       console.error("[updateProduct] Missing slug, productId, or productData!");
       throw new Error("Restaurant slug, Product ID, and product data are required to update a product.");
   }

  // Llama a authenticatedRequest con PATCH al endpoint de detalle de producto
   console.log(`[updateProduct] Calling authenticatedRequest PATCH /restaurantes/${restauranteSlug}/menu/${productId}/ with data:`, productData);
  // Usamos PATCH para actualizar parcialmente (solo los campos que se envían en productData)
  return authenticatedRequest('PATCH', `/restaurantes/${restauranteSlug}/menu/${productId}/`, productData);
}

// --- Nueva función para ELIMINAR un Producto (DELETE) ---
export async function deleteProduct(restauranteSlug, productId) {
   console.log(`[deleteProduct] Starting for slug ${restauranteSlug}, productId ${productId}...`); // Log de inicio
  if (!restauranteSlug || !productId) {
       console.error("[deleteProduct] Missing slug or productId!");
      throw new Error("Restaurant slug and Product ID are required to delete a product.");
  }

  // Llama a authenticatedRequest con DELETE al endpoint de detalle de producto
   console.log(`[deleteProduct] Calling authenticatedRequest DELETE /restaurantes/${restauranteSlug}/menu/${productId}/`);
  // DELETE usualmente retorna 204 No Content, por lo que authenticatedRequest retornará null
  return authenticatedRequest('DELETE', `/restaurantes/${restauranteSlug}/menu/${productId}/`);
}

// --- Nuevas funciones para Métodos de Pago ---

// Para obtener la lista de métodos de pago de un restaurante
export async function getPaymentMethods(restauranteSlug) {
  console.log(`[getPaymentMethods] Starting for slug ${restauranteSlug}...`); // Log de inicio
  if (!restauranteSlug) {
      console.error("[getPaymentMethods] Slug is null or undefined when fetching payment methods!");
      throw new Error("Restaurant slug is required to fetch payment methods.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/metodos-pago/`; // <<-- Asegúrate que este endpoint coincida con tu urls.py
  console.log(`[getPaymentMethods] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest('GET', endpoint);
}

// Para crear un nuevo método de pago
export async function createPaymentMethod(restauranteSlug, methodData) {
   console.log(`[createPaymentMethod] Starting for slug ${restauranteSlug} with data:`, methodData); // Log de inicio
  if (!restauranteSlug || !methodData) {
      console.error("[createPaymentMethod] Missing slug or methodData!");
      throw new Error("Restaurant slug and payment method data are required to create a payment method.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/metodos-pago/`; // <<-- POST al mismo endpoint de lista
  console.log(`[createPaymentMethod] Calling authenticatedRequest POST ${endpoint} with data:`, methodData);
  // Enviamos JSON para la mayoría de campos de MetodoPago, no suele haber archivos.
  return authenticatedRequest('POST', endpoint, methodData); // authenticatedRequest manejará JSON.stringify
}

// Para obtener los detalles de un método de pago específico
export async function getPaymentMethodDetail(restauranteSlug, methodId) {
  console.log(`[getPaymentMethodDetail] Starting for slug ${restauranteSlug}, methodId ${methodId}...`); // Log de inicio
  if (!restauranteSlug || !methodId) {
       console.error("[getPaymentMethodDetail] Missing slug or methodId!");
      throw new Error("Restaurant slug and Method ID are required to fetch payment method details.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/metodos-pago/${methodId}/`; // <<-- Endpoint de detalle
  console.log(`[getPaymentMethodDetail] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest('GET', endpoint);
}

// Para actualizar un método de pago (PATCH)
export async function updatePaymentMethod(restauranteSlug, methodId, methodData) {
   console.log(`[updatePaymentMethod] Starting for slug ${restauranteSlug}, methodId ${methodId} with data:`, methodData); // Log de inicio
  if (!restauranteSlug || !methodId || !methodData) {
      console.error("[updatePaymentMethod] Missing slug, methodId, or methodData!");
      throw new Error("Restaurant slug, Method ID, and method data are required to update a payment method.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/metodos-pago/${methodId}/`; // <<-- Endpoint de detalle
  console.log(`[updatePaymentMethod] Calling authenticatedRequest PATCH ${endpoint} with data:`, methodData);
  // Enviamos JSON (o FormData si tuvieras un campo File/Image, aunque no es común para MetodoPago)
   // Asumimos JSON por ahora.
  return authenticatedRequest('PATCH', endpoint, methodData);
}

// Para eliminar un método de pago (DELETE)
export async function deletePaymentMethod(restauranteSlug, methodId) {
   console.log(`[deletePaymentMethod] Starting for slug ${restauranteSlug}, methodId ${methodId}...`); // Log de inicio
  if (!restauranteSlug || !methodId) {
       console.error("[deletePaymentMethod] Missing slug or methodId!");
      throw new Error("Restaurant slug and Method ID are required to delete a payment method.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/metodos-pago/${methodId}/`; // <<-- Endpoint de detalle
  console.log(`[deletePaymentMethod] Calling authenticatedRequest DELETE ${endpoint}`);
  // DELETE usualmente retorna 204 No Content
  return authenticatedRequest('DELETE', endpoint);
}



// --- Nuevas funciones para Gestión de Envíos ---

// Para obtener la lista de opciones de envío de un restaurante
export async function getDeliveries(restauranteSlug) {
  console.log(`[getDeliveries] Starting for slug ${restauranteSlug}...`); // Log de inicio
  if (!restauranteSlug) {
      console.error("[getDeliveries] Slug is null or undefined when fetching deliveries!");
      throw new Error("Restaurant slug is required to fetch deliveries.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/envios/`; // <<-- Asegúrate que este endpoint coincida con tu urls.py
  console.log(`[getDeliveries] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest('GET', endpoint);
}

// Para crear una nueva opción de envío
export async function createDelivery(restauranteSlug, deliveryData) {
   console.log(`[createDelivery] Starting for slug ${restauranteSlug} with data:`, deliveryData); // Log de inicio
  if (!restauranteSlug || !deliveryData) {
      console.error("[createDelivery] Missing slug or deliveryData!");
      throw new Error("Restaurant slug and delivery data are required to create a delivery option.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/envios/`; // <<-- POST al mismo endpoint de lista
  console.log(`[createDelivery] Calling authenticatedRequest POST ${endpoint} with data:`, deliveryData);
  // Enviamos JSON para la mayoría de campos de Envio.
  return authenticatedRequest('POST', endpoint, deliveryData); // authenticatedRequest manejará JSON.stringify
}

// Para obtener los detalles de una opción de envío específica
export async function getDeliveryDetail(restauranteSlug, envioId) { // <-- Usar envioId consistentemente
  console.log(`[getDeliveryDetail] Starting for slug ${restauranteSlug}, envioId ${envioId}...`); // Log de inicio
  if (!restauranteSlug || !envioId) {
       console.error("[getDeliveryDetail] Missing slug or envioId!");
      throw new Error("Restaurant slug and Delivery ID are required to fetch delivery details.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/envios/${envioId}/`; // <<-- Endpoint de detalle
  console.log(`[getDeliveryDetail] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest('GET', endpoint);
}

// Para actualizar una opción de envío (PATCH)
export async function updateDelivery(restauranteSlug, envioId, deliveryData) { // <-- Usar envioId
   console.log(`[updateDelivery] Starting for slug ${restauranteSlug}, envioId ${envioId} with data:`, deliveryData); // Log de inicio
  if (!restauranteSlug || !envioId || !deliveryData) {
      console.error("[updateDelivery] Missing slug, envioId, or deliveryData!");
      throw new Error("Restaurant slug, Delivery ID, and delivery data are required to update a delivery option.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/envios/${envioId}/`; // <<-- Endpoint de detalle
  console.log(`[updateDelivery] Calling authenticatedRequest PATCH ${endpoint} with data:`, deliveryData);
  // Enviamos JSON (o FormData si hubiera archivos)
  return authenticatedRequest('PATCH', endpoint, deliveryData);
}

// Para eliminar una opción de envío (DELETE)
export async function deleteDelivery(restauranteSlug, envioId) { // <-- Usar envioId
   console.log(`[deleteDelivery] Starting for slug ${restauranteSlug}, envioId ${envioId}...`); // Log de inicio
  if (!restauranteSlug || !envioId) {
       console.error("[deleteDelivery] Missing slug or envioId!");
      throw new Error("Restaurant slug and Delivery ID are required to delete a delivery option.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/envios/${envioId}/`; // <<-- Endpoint de detalle
  console.log(`[deleteDelivery] Calling authenticatedRequest DELETE ${endpoint}`);
  // DELETE usualmente retorna 204 No Content
  return authenticatedRequest('DELETE', endpoint);
}


// --- Nuevas funciones para Gestión de Redes Sociales ---

// Para obtener la lista de enlaces de redes sociales de un restaurante
export async function getSocialLinks(restauranteSlug) {
  console.log(`[getSocialLinks] Starting for slug ${restauranteSlug}...`); // Log de inicio
  if (!restauranteSlug) {
      console.error("[getSocialLinks] Slug is null or undefined when fetching social links!");
      throw new Error("Restaurant slug is required to fetch social links.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/redes-sociales/`; // <<-- Asegúrate que este endpoint coincida con tu urls.py
  console.log(`[getSocialLinks] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest('GET', endpoint);
}

// Para crear un nuevo enlace de red social
export async function createSocialLink(restauranteSlug, socialLinkData) {
   console.log(`[createSocialLink] Starting for slug ${restauranteSlug} with data:`, socialLinkData); // Log de inicio
  if (!restauranteSlug || !socialLinkData) {
      console.error("[createSocialLink] Missing slug or socialLinkData!");
      throw new Error("Restaurant slug and social link data are required to create a social link.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/redes-sociales/`; // <<-- POST al mismo endpoint de lista
  console.log(`[createSocialLink] Calling authenticatedRequest POST ${endpoint} with data:`, socialLinkData);
  // Enviamos JSON.
  return authenticatedRequest('POST', endpoint, socialLinkData); // authenticatedRequest manejará JSON.stringify
}

// Para obtener los detalles de un enlace de red social específico
export async function getSocialLinkDetail(restauranteSlug, redSocialId) { // <<-- Usar redSocialId consistentemente
  console.log(`[getSocialLinkDetail] Starting for slug ${restauranteSlug}, redSocialId ${redSocialId}...`); // Log de inicio
  if (!restauranteSlug || !redSocialId) {
       console.error("[getSocialLinkDetail] Missing slug or redSocialId!");
      throw new Error("Restaurant slug and Social Link ID are required to fetch social link details.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/redes-sociales/${redSocialId}/`; // <<-- Endpoint de detalle
  console.log(`[getSocialLinkDetail] Calling authenticatedRequest GET ${endpoint}`);
  return authenticatedRequest('GET', endpoint);
}

// Para actualizar un enlace de red social (PATCH)
export async function updateSocialLink(restauranteSlug, redSocialId, socialLinkData) { // <<-- Usar redSocialId
   console.log(`[updateSocialLink] Starting for slug ${restauranteSlug}, redSocialId ${redSocialId} with data:`, socialLinkData); // Log de inicio
  if (!restauranteSlug || !redSocialId || !socialLinkData) {
      console.error("[updateSocialLink] Missing slug, redSocialId, or socialLinkData!");
      throw new Error("Restaurant slug, Social Link ID, and social link data are required to update a social link.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/redes-sociales/${redSocialId}/`; // <<-- Endpoint de detalle
  console.log(`[updateSocialLink] Calling authenticatedRequest PATCH ${endpoint} with data:`, socialLinkData);
  // Enviamos JSON.
  return authenticatedRequest('PATCH', endpoint, socialLinkData);
}

// Para eliminar un enlace de red social (DELETE)
export async function deleteSocialLink(restauranteSlug, redSocialId) { // <<-- Usar redSocialId
   console.log(`[deleteSocialLink] Starting for slug ${restauranteSlug}, redSocialId ${redSocialId}...`); // Log de inicio
  if (!restauranteSlug || !redSocialId) {
       console.error("[deleteSocialLink] Missing slug or redSocialId!");
      throw new Error("Restaurant slug and Social Link ID are required to delete a social link.");
  }
  const endpoint = `/restaurantes/${restauranteSlug}/redes-sociales/${redSocialId}/`; // <<-- Endpoint de detalle
  console.log(`[deleteSocialLink] Calling authenticatedRequest DELETE ${endpoint}`);
  // DELETE usualmente retorna 204 No Content
  return authenticatedRequest('DELETE', endpoint);
}