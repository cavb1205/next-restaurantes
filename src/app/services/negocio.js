export async function getNegocios() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/restaurantes`
    );

    if (!response.ok) {
      throw new Error("Error al obtener los negocios");
    }

    const data = await response.json();
    console.log(data);

    return data;
  } catch (error) {
    console.error("Error al obtener los negocios:", error);
    return { error: "Error al obtener los negocios" };
  }
}

export async function getNegocio(slug) {
  try {

    const response = await fetch(
      `${process.env.API_URL}/api/restaurantes/${slug}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos del negocio");
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error al obtener los dato del negocio:", error);
    return { error: "Error al obtener los datos del negocio" };
  }
}

export async function getNegocioId(id) {
  try {
    
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/restaurantes/${id}`
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos del negocio");
    }

    const data = await response.json();
    console.log(data);
    return data;
  } catch (error) {
    console.error("Error al obtener los dato del negocio:", error);
    return { error: "Error al obtener los datos del negocio" };
  }
}


