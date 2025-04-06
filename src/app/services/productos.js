export async function getProductos(idNegocio) {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/productos?filters[negocio][id][$eq]=${idNegocio}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return { error: "Error al obtener productos" };
  }
}

export async function getCategorias(idNegocio) {
  try {
    const response = await fetch(
      `${process.env.API_URL}/api/categorias?filters[negocio][id][$eq]=${idNegocio}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
    });
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return { error: "Error al obtener categorías" };
  }
}