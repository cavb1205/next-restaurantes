
export async function login(username, password) {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/token/`, { // URL de tu endpoint JWT obtain
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });
  
      // Verificar si la respuesta HTTP no fue exitosa (ej: 401, 400)
      if (!response.ok) {
        // Intentar leer el cuerpo de la respuesta para obtener detalles del error del backend
        const errorData = await response.json();
        // Crear un nuevo Error y adjuntar los detalles de la respuesta para manejo externo
        const error = new Error(errorData.detail || `Error HTTP: ${response.status}`);
        error.response = { status: response.status, data: errorData }; // Adjuntar información de la respuesta
        throw error; // Lanzar el error para que sea capturado en el catch del componente
      }
  
      // Si la respuesta fue exitosa (ej: 200 OK), parsear el cuerpo JSON
      const data = await response.json();
      // Devolver los datos (que deben contener access y refresh tokens)
      return data;
  
    } catch (error) {
      // Relanzar el error (con los detalles adjuntos si es un error HTTP)
      // para que el componente que llamó a `login` pueda manejarlo.
      console.error("Error in authService.login:", error);
      throw error;
    }
  }