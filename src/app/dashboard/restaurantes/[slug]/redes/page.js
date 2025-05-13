// app/dashboard/restaurantes/[slug]/redes/page.js
"use client"; // Client Component

import { useState, useEffect } from "react"; // Hooks
import { useParams } from "next/navigation"; // Hook para slug
import Link from "next/link"; // Para enlaces
// Importa la función para listar enlaces
import { getSocialLinks } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

export default function SocialLinksPage() {
  const params = useParams();
  const restauranteSlug = params.slug; // Slug del restaurante

  // Estados para la lista de enlaces, carga y error
  const [socialLinks, setSocialLinks] = useState([]); // Lista de enlaces
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(`[SocialLinksPage] Renderizado para slug = ${restauranteSlug}`);

  // Efecto para obtener los enlaces cuando el componente se monta o el slug cambia
  useEffect(() => {
    console.log("[SocialLinksPage] Efecto de carga de enlaces disparado.");

    if (!restauranteSlug) {
      console.warn("[SocialLinksPage] No hay slug de restaurante en la URL.");
      setError("Slug de restaurante no proporcionado en la URL.");
      setLoading(false);
      return;
    }

    const fetchSocialLinks = async () => {
      console.log(`[SocialLinksPage] Iniciando obtención de enlaces para slug: ${restauranteSlug}`);
      try {
        setLoading(true); // Inicia carga
        setError(null); // Limpia errores previos
        setSocialLinks([]); // Limpia lista previa

        // **Llama a la función de la API**
        const socialLinksData = await getSocialLinks(restauranteSlug);
        console.log("[SocialLinksPage] getSocialLinks retornó:", socialLinksData);

        if (socialLinksData) {
          // Asumiendo que la API devuelve una lista de enlaces
          setSocialLinks(socialLinksData); // Setea la lista
        } else {
           setSocialLinks([]); // Si retorna null o vacío
            console.log("[SocialLinksPage] La obtención de enlaces retornó vacío o nulo.");
        }

      } catch (err) {
        console.error("[SocialLinksPage] Error al obtener enlaces de redes sociales:", err);
        setError("Error al cargar los enlaces de redes sociales del restaurante."); // Setea error
      } finally {
        setLoading(false); // Desactiva carga
        console.log("[SocialLinksPage] Finalizada obtención de enlaces de redes sociales.");
      }
    };

    // Dispara la función de obtención
    fetchSocialLinks();

    // Dependencias: restauranteSlug
  }, [restauranteSlug]); // Añade getSocialLinks si eslint lo pide


  // --- Lógica de Renderizado ---

  // Mostrar estado de carga
  if (loading) {
    console.log("[SocialLinksPage] Renderizando Pantalla de Carga...");
    return ( /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando enlaces de redes sociales...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
     console.log("[SocialLinksPage] Renderizando Pantalla de Error...");
    return ( /* ... (Código de pantalla de error) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay enlaces (carga terminada, no error, lista vacía)
  if (socialLinks.length === 0) {
     console.log("[SocialLinksPage] Renderizando Mensaje de Lista Vacía...");
    return ( /* ... (Código de mensaje de lista vacía) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Información:</p>
          <p>No se encontraron enlaces de redes sociales configurados para este restaurante.</p>
           {/* Botón para añadir nuevo enlace */}
           {restauranteSlug && ( // Asegura que tenemos el slug
               <Link href={`/dashboard/restaurantes/${restauranteSlug}/redes/crear`} className="mt-4 inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200">
                   Añadir Nuevo Enlace
               </Link>
           )}
        </div>
      </div>
    );
  }

  // Mostrar la lista de enlaces
  console.log("[SocialLinksPage] Renderizando Lista de Enlaces...");
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl"> {/* Contenedor principal */}

        {/* Botón para volver */}
        {/* <Link href={`/dashboard`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver al Panel
        </Link> */}

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestionar Redes Sociales ({restauranteSlug})</h1>

      {/* Botón para añadir nuevo enlace */}
      {restauranteSlug && ( // Asegura que tenemos el slug
          <div className="mb-8">
              <Link
                   href={`/dashboard/restaurantes/${restauranteSlug}/redes/crear`} // <<-- Link a la página de creación (la crearemos después)
                   className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
              >
                  Añadir Nuevo Enlace
              </Link>
           </div>
      )}


      {/* Lista de enlaces en una tabla */}
       <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
           <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                   <tr>
                       {/* Encabezados de columna */}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Plataforma
                       </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           URL
                       </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Activo
                       </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                           Orden
                       </th>
                       <th scope="col" className="relative px-6 py-3">
                           {/* Columna vacía para acciones */}
                           <span className="sr-only">Editar/Eliminar</span>
                       </th>
                   </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                   {/* Mapea sobre la lista de enlaces */}
                   {socialLinks.map(link => (
                       // Cada fila es un Link a la página de detalle/edición
                       <tr key={link.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                                {link.tipo || 'N/A'}
                           </td>
                           <td className="px-6 py-4 text-sm text-blue-600 hover:underline">
                               {/* Envuelve la URL en un enlace real */}
                               <a href={link.url} target="_blank" rel="noopener noreferrer">
                                   {link.url || 'Sin URL'}
                               </a>
                           </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {link.activo ? 'Sí' : 'No'}
                           </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                               {link.orden != null ? link.orden : 'N/A'}
                           </td>
                           <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {/* Link a la página de detalle/edición de este enlace */}
                               {restauranteSlug && ( // Asegura que tenemos el slug
                                    <Link href={`/dashboard/restaurantes/${restauranteSlug}/redes/${link.id}`} className="text-blue-600 hover:text-blue-900">
                                        Editar
                                    </Link>
                               )}
                               {/* Opcional: Botón Eliminar directo en la lista (con confirmación) */}
                               {/* <button onClick={() => handleDelete(link.id)} className="ml-4 text-red-600 hover:text-red-900">Eliminar</button> */}
                           </td>
                       </tr>
                   ))}
               </tbody>
           </table>
       </div>


    </div>
  );
}