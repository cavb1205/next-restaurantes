// app/dashboard/restaurantes/[slug]/envios/page.js
"use client"; // Client Component

import { useState, useEffect } from "react"; // Hooks
import { useParams } from "next/navigation"; // Hook para slug
import Link from "next/link"; // Para enlaces
// Importa la función para listar envíos
import { getDeliveries } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

export default function DeliveriesPage() {
  const params = useParams();
  const restauranteSlug = params.slug; // Slug del restaurante

  // Estados para la lista de envíos, carga y error
  const [deliveries, setDeliveries] = useState([]); // Lista de envíos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(`[DeliveriesPage] Renderizado para slug = ${restauranteSlug}`);

  // Efecto para obtener los envíos cuando el componente se monta o el slug cambia
  useEffect(() => {
    console.log("[DeliveriesPage] Efecto de carga de envíos disparado.");

    if (!restauranteSlug) {
      console.warn("[DeliveriesPage] No hay slug de restaurante en la URL.");
      setError("Slug de restaurante no proporcionado en la URL.");
      setLoading(false);
      return;
    }

    const fetchDeliveries = async () => {
      console.log(
        `[DeliveriesPage] Iniciando obtención de envíos para slug: ${restauranteSlug}`
      );
      try {
        setLoading(true); // Inicia carga
        setError(null); // Limpia errores previos
        setDeliveries([]); // Limpia lista previa

        // **Llama a la función de la API**
        const deliveriesData = await getDeliveries(restauranteSlug);
        console.log("[DeliveriesPage] getDeliveries retornó:", deliveriesData);

        if (deliveriesData) {
          // Asumiendo que la API devuelve una lista de opciones de envío
          setDeliveries(deliveriesData); // Setea la lista
        } else {
          setDeliveries([]); // Si retorna null o vacío
          console.log(
            "[DeliveriesPage] La obtención de envíos retornó vacío o nulo."
          );
        }
      } catch (err) {
        console.error("[DeliveriesPage] Error al obtener envíos:", err);
        setError("Error al cargar las opciones de envío del restaurante."); // Setea error
      } finally {
        setLoading(false); // Desactiva carga
        console.log("[DeliveriesPage] Finalizada obtención de envíos.");
      }
    };

    // Dispara la función de obtención
    fetchDeliveries();

    // Dependencias: restauranteSlug
  }, [restauranteSlug]); // Añade getDeliveries si eslint lo pide

  // --- Lógica de Renderizado ---

  // Mostrar estado de carga
  if (loading) {
    console.log("[DeliveriesPage] Renderizando Pantalla de Carga...");
    return (
      /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando opciones de envío...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    console.log("[DeliveriesPage] Renderizando Pantalla de Error...");
    return (
      /* ... (Código de pantalla de error) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay envíos (carga terminada, no error, lista vacía)
  if (deliveries.length === 0) {
    console.log("[DeliveriesPage] Renderizando Mensaje de Lista Vacía...");
    return (
      /* ... (Código de mensaje de lista vacía) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Información:</p>
          <p>
            No se encontraron opciones de envío configuradas para este
            restaurante.
          </p>
          {/* Botón para añadir nueva opción de envío */}
          {restauranteSlug && ( // Asegura que tenemos el slug
            <Link
              href={`/dashboard/restaurantes/${restauranteSlug}/envios/crear`}
              className="mt-4 inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
            >
              Añadir Nueva Opción de Envío
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Mostrar la lista de envíos
  console.log("[DeliveriesPage] Renderizando Lista de Envíos...");
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {" "}
      {/* Contenedor principal */}
      {/* Botón para volver */}
      {/* <Link href={`/dashboard`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver al Panel
        </Link> */}
      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gestionar Opciones de Envío ({restauranteSlug})
      </h1>
      {/* Botón para añadir nueva opción de envío */}
      {restauranteSlug && ( // Asegura que tenemos el slug
        <div className="mb-8">
          <Link
            href={`/dashboard/restaurantes/${restauranteSlug}/envios/crear`} // <<-- Link a la página de creación (la crearemos después)
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
          >
            Añadir Nueva Opción de Envío
          </Link>
        </div>
      )}
      {/* Lista de envíos en una tabla */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Encabezados de columna */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Nombre
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Costo
              </th>

              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Activo
              </th>
              <th scope="col" className="relative px-6 py-3">
                {/* Columna vacía para acciones */}
                <span className="sr-only">Editar/Eliminar</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Mapea sobre la lista de envíos */}
            {deliveries.map((delivery) => (
              // Cada fila es un Link a la página de detalle/edición
              <tr key={delivery.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {delivery.nombre || "Sin Nombre"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {/* Formatear el costo como moneda */}
                  {delivery.precio != null
                    ? parseFloat(delivery.precio).toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })
                    : "N/A"}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">
                  {delivery.estado}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Link a la página de detalle/edición de este envío */}
                  {restauranteSlug && ( // Asegura que tenemos el slug
                    <Link
                      href={`/dashboard/restaurantes/${restauranteSlug}/envios/${delivery.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </Link>
                  )}
                  {/* Opcional: Botón Eliminar directo en la lista (con confirmación) */}
                  {/* <button onClick={() => handleDelete(delivery.id)} className="ml-4 text-red-600 hover:text-red-900">Eliminar</button> */}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Opcional: Mostrar descripción larga si la tienes en el modelo y no en la tabla */}
      {/* delivery.descripcion */}
    </div>
  );
}
