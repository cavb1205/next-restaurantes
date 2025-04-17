export async function createOrden(ordenData) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ordens`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
        body: JSON.stringify({ data: ordenData }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error al crear la orden:', errorData);
      throw new Error("Error al crear la orden");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al crear la orden:", error);
    return { error: error.message || "Error al crear la orden" };
  }
}

export async function getOrden(id) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/ordens/${id}?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos de la orden");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener los datos de la orden:", error);
    return { error: "Error al obtener los datos de la orden" };
  }
} 