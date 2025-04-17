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

// export async function getNegocioEnvios(negocioId) {
//   try {
//     const response = await fetch(
//       `${process.env.NEXT_PUBLIC_API_URL}/api/negocios?filters[id][$eq]=${negocioId}&populate=envios&populate=metodo_pagos`,
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN}`,
//         },
//       }
//     );

//     if (!response.ok) {
//       throw new Error("Error al obtener los envios del negocio");
//     }

//     const data = await response.json();
//     console.log(data.data)
//     return data.data;
//   } catch (error) {
//     console.error("Error al obtener los envios del negocio:", error);
//     return { error: "Error al obtener los envios del negocio" };
//   }
// }
