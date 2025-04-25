export async function createOrden(ordenData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ordenes/`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(ordenData ),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al crear la orden:', errorData);
      throw new Error("Error al crear la orden");
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return { error: error.message || "Error al crear la orden" };
  }
}

export async function getOrden(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ordenes/${id}`,
      {
        method: 'GET',
       
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos de la orden");
    }

    const data = await response.json();
    return data
  } catch (error) {
    console.error("Error al obtener los datos de la orden:", error);
    return { error: "Error al obtener los datos de la orden" };
  }
} 