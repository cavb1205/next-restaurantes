// app/dashboard/restaurantes/[slug]/ordenes/page.js
"use client"; // Este es un Client Component

import { useState, useEffect } from "react";
import { useParams } from "next/navigation"; // Hook para acceder a los parámetros de la URL (como [slug])
import Link from "next/link"; // Para enlaces a detalles de órdenes (si los creas después)
// Importa la nueva función para obtener órdenes
import { getRestaurantOrders } from "@/app/services/apiService"; // Asegúrate de la ruta correcta

export default function RestaurantOrdersPage() {
  // Obtiene los parámetros de la URL. 'slug' coincidirá con el nombre de la carpeta '[slug]'.
  const params = useParams();
  const restauranteSlug = params.slug; // Extrae el slug de la URL

  // Estados para la lista de órdenes, carga y error
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(`RestaurantOrdersPage: Renderizado para slug = ${restauranteSlug}`);

  // Efecto para obtener las órdenes cuando el componente se monta o el slug cambia
  useEffect(() => {
    console.log("RestaurantOrdersPage: Efecto de carga de órdenes disparado.");

    // Si no hay slug, no podemos obtener órdenes. Esto no debería pasar si la ruta funciona bien,
    // pero es una verificación de seguridad.
    if (!restauranteSlug) {
      console.warn("RestaurantOrdersPage: No hay slug de restaurante en la URL.");
      // Podrías setear un error o redirigir
      setError("Slug de restaurante no proporcionado en la URL.");
      setLoading(false);
      return;
    }

    const fetchOrders = async () => {
      console.log(`RestaurantOrdersPage: Iniciando obtención de órdenes para slug: ${restauranteSlug}`);
      try {
        setLoading(true); // Inicia el estado de carga
        setError(null); // Limpia errores previos

        // **Llama a la nueva función de la API**
        const ordersData = await getRestaurantOrders(restauranteSlug);
        console.log("RestaurantOrdersPage: getRestaurantOrders retornó:", ordersData);

        if (ordersData) {
          setOrders(ordersData); // Setea las órdenes en el estado
        } else {
            // Si la API retorna null o vacío, se maneja como lista vacía
            setOrders([]);
             console.log("RestaurantOrdersPage: La obtención de órdenes retornó vacío o nulo.");
        }

      } catch (err) {
        console.error("RestaurantOrdersPage: Error al obtener órdenes:", err);
        // Asumiendo que authenticatedRequest maneja 401 y el Layout redirige.
        // Manejar otros errores (red, API error) aquí.
        setError("Error al cargar la lista de órdenes.");
      } finally {
        setLoading(false); // Desactiva el estado de carga al finalizar
        console.log("RestaurantOrdersPage: Finalizada obtención de órdenes.");
      }
    };

    // Dispara la función de obtención de órdenes
    fetchOrders();

    // Dependencias del efecto:
    // - restauranteSlug: Para re-obtener órdenes si el slug en la URL cambia dinámicamente
    // - getRestaurantOrders: Aunque la función API es estable, es buena práctica si pudiera cambiar (raro)
    // - setLoading, setError, setOrders: React sugiere añadirlas, aunque usualmente no causan loops aquí.
  }, [restauranteSlug, getRestaurantOrders, setLoading, setError, setOrders]);


  // --- Lógica de Renderizado ---

  // Mostrar estado de carga
  if (loading) {
    console.log("RestaurantOrdersPage: Renderizando Pantalla de Carga...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando órdenes...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    console.log("RestaurantOrdersPage: Renderizando Pantalla de Error...");
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay órdenes (carga terminada, no hay error, lista vacía)
  if (orders.length === 0) {
     console.log("RestaurantOrdersPage: Renderizando Mensaje de No Hay Órdenes...");
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Información:</p>
          <p>No se encontraron órdenes para este restaurante.</p>
        </div>
      </div>
    );
  }

  // Mostrar la lista de órdenes (carga terminada, no hay error, hay elementos en la lista)
  console.log("RestaurantOrdersPage: Renderizando Lista de Órdenes...");
  return (
    <div className="py-2">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Gestión de Órdenes ({restauranteSlug})</h1>

      {/* Aquí mapearías sobre la lista 'orders' para mostrar cada orden */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Lista de Órdenes</h2>
         <ul className="divide-y divide-gray-200">
             {orders.map(order => (
                 // Asumiendo que cada objeto 'order' tiene un 'id' y quizás un 'estado' o 'total'
                 // Reemplaza 'order.id', 'order.estado', 'order.total' con las propiedades reales de tu objeto Order
                 <li key={order.id} className="py-4 flex justify-between items-center hover:bg-gray-50 transition duration-150 px-2 -mx-2 rounded">
                     {/* Puedes hacer que cada ítem sea un Link a la página de detalle de la orden si creas esa ruta */}
                     <Link href={`/dashboard/restaurantes/${restauranteSlug}/ordenes/${order.id}`} className="flex justify-between items-center w-full">
                         <div>
                             <p className="text-lg font-semibold text-gray-700">Orden #{order.id}</p>
                              {/* Ejemplo: Mostrar estado si existe */}
                              {order.estado && <p className="text-sm text-gray-600 capitalize">Estado: {order.estado.replace('_', ' ')}</p>}
                         </div>
                         <div className="text-right">
                             {/* Ejemplo: Mostrar total si existe */}
                             {order.total && <p className="text-xl font-bold text-primary">{parseFloat(order.total).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>}
                         </div>
                      </Link>
                 </li>
             ))}
         </ul>
      </div>

      {/* Puedes añadir botones para filtrar, paginar, añadir nueva orden, etc. */}

    </div>
  );
}