// app/dashboard/restaurantes/[slug]/pagos/page.js
"use client"; // Client Component

import { useState, useEffect } from "react"; // Hooks
import { useParams } from "next/navigation"; // Hook para slug
import Link from "next/link"; // Para enlaces
// Importa la función para listar métodos de pago
import { getPaymentMethods } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

export default function PaymentMethodsPage() {
  const params = useParams();
  const restauranteSlug = params.slug; // Slug del restaurante

  // Estados para la lista de métodos de pago, carga y error
  const [paymentMethods, setPaymentMethods] = useState([]); // Lista de métodos
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(
    `[PaymentMethodsPage] Renderizado para slug = ${restauranteSlug}`
  );

  // Efecto para obtener los métodos de pago cuando el componente se monta o el slug cambia
  useEffect(() => {
    console.log(
      "[PaymentMethodsPage] Efecto de carga de métodos de pago disparado."
    );

    if (!restauranteSlug) {
      console.warn(
        "[PaymentMethodsPage] No hay slug de restaurante en la URL."
      );
      setError("Slug de restaurante no proporcionado en la URL.");
      setLoading(false);
      return;
    }

    const fetchPaymentMethods = async () => {
      console.log(
        `[PaymentMethodsPage] Iniciando obtención de métodos de pago para slug: ${restauranteSlug}`
      );
      try {
        setLoading(true); // Inicia carga
        setError(null); // Limpia errores previos
        setPaymentMethods([]); // Limpia lista previa

        // **Llama a la función de la API**
        const methodsData = await getPaymentMethods(restauranteSlug);
        console.log(
          "[PaymentMethodsPage] getPaymentMethods retornó:",
          methodsData
        );

        if (methodsData) {
          // Asumiendo que la API devuelve una lista de métodos de pago
          setPaymentMethods(methodsData); // Setea la lista
        } else {
          setPaymentMethods([]); // Si retorna null o vacío
          console.log(
            "[PaymentMethodsPage] La obtención de métodos de pago retornó vacío o nulo."
          );
        }
      } catch (err) {
        console.error(
          "[PaymentMethodsPage] Error al obtener métodos de pago:",
          err
        );
        setError("Error al cargar los métodos de pago del restaurante."); // Setea error
      } finally {
        setLoading(false); // Desactiva carga
        console.log(
          "[PaymentMethodsPage] Finalizada obtención de métodos de pago."
        );
      }
    };

    // Dispara la función de obtención
    fetchPaymentMethods();

    // Dependencias: restauranteSlug
  }, [restauranteSlug]); // Añade getPaymentMethods si eslint lo pide

  // --- Lógica de Renderizado ---

  // Mostrar estado de carga
  if (loading) {
    console.log("[PaymentMethodsPage] Renderizando Pantalla de Carga...");
    return (
      /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando métodos de pago...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    console.log("[PaymentMethodsPage] Renderizando Pantalla de Error...");
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

  // Mostrar mensaje si no hay métodos de pago (carga terminada, no error, lista vacía)
  if (paymentMethods.length === 0) {
    console.log("[PaymentMethodsPage] Renderizando Mensaje de Lista Vacía...");
    return (
      /* ... (Código de mensaje de lista vacía) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Información:</p>
          <p>
            No se encontraron métodos de pago configurados para este
            restaurante.
          </p>
          {/* Botón para añadir nuevo método de pago */}
          {restauranteSlug && ( // Asegura que tenemos el slug antes de generar el Link
            <Link
              href={`/dashboard/restaurantes/${restauranteSlug}/pagos/crear`}
              className="mt-4 inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
            >
              Añadir Nuevo Método de Pago
            </Link>
          )}
        </div>
      </div>
    );
  }

  // Mostrar la lista de métodos de pago
  console.log("[PaymentMethodsPage] Renderizando Lista de Métodos de Pago...");
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {" "}
      {/* Contenedor principal */}
      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Gestionar Métodos de Pago ({restauranteSlug})
      </h1>
      {/* Botón para añadir nuevo método de pago */}
      {restauranteSlug && ( // Asegura que tenemos el slug antes de generar el Link
        <div className="mb-8">
          <Link
            href={`/dashboard/restaurantes/${restauranteSlug}/pagos/crear`} // <<-- Link a la página de creación (la crearemos después)
            className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
          >
            Añadir Nuevo Método de Pago
          </Link>
        </div>
      )}
      {/* Lista de métodos de pago en una tabla (común para listas de configuración) */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              {/* Encabezados de columna */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Tipo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Descripción
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Activo
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Orden
              </th>
              <th scope="col" className="relative px-6 py-3">
                {/* Columna vacía para acciones */}
                <span className="sr-only">Editar/Eliminar</span>
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {/* Mapea sobre la lista de métodos de pago */}
            {paymentMethods.map((method) => (
              // Cada fila es un Link a la página de detalle/edición
              <tr key={method.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 capitalize">
                  {method.tipo ? method.tipo.replace("_", " ") : "N/A"}{" "}
                  {/* Muestra tipo, reemplazando '_' */}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {method.descripcion || "Sin descripción"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {method.activo ? "Sí" : "No"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {method.orden != null ? method.orden : "N/A"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  {/* Link a la página de detalle/edición de este método */}
                  {restauranteSlug && ( // Asegura que tenemos el slug
                    <Link
                      href={`/dashboard/restaurantes/${restauranteSlug}/pagos/${method.id}`}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Editar
                    </Link>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
