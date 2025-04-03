export async function getNegocios() {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/negocios?populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los negocios");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener los negocios:", error);
    return { error: "Error al obtener los negocios" };
  }
}

export async function getNegocio(slug) {
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/negocios?filters[slug][$eq]=${slug}&populate=*`,
      {
        headers: {
          Authorization: `Bearer ${process.env.API_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Error al obtener los datos del negocio");
    }

    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error("Error al obtener los dato del negocio:", error);
    return { error: "Error al obtener los datos del negocio" };
  }
}
