// app/dashboard/restaurantes/[slug]/menu/page.js
"use client"; // Este es un Client Component

import { useState, useEffect } from "react"; // Importa hooks necesarios de React
import { useParams } from "next/navigation"; // Hook para acceder a los parámetros de la URL (como [slug])

import Image from 'next/image'; // Para mostrar imágenes (si tus productos tienen)
// Importa la nueva función para obtener el menú
import { getRestaurantMenu } from "@/app/services/apiService"; // <<-- Asegúrate de que esta ruta de importación sea correcta
import Link from "next/link";

export default function RestaurantMenuPage() {
  // Obtiene los parámetros de la URL. 'slug' coincidirá con el nombre de la carpeta '[slug]'.
  const params = useParams();
  const restauranteSlug = params.slug; // Extrae el slug de la URL

  // Estados para la lista de ítems del menú, carga y error
  const [menuItems, setMenuItems] = useState([]); // Lista de productos/ítems del menú
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  console.log(`[RestaurantMenuPage] Renderizado para slug = ${restauranteSlug}`);

  // Efecto para obtener los ítems del menú cuando el componente se monta o el slug cambia
  useEffect(() => {
    console.log("[RestaurantMenuPage] Efecto de carga del menú disparado.");

    // Si no hay slug, no podemos obtener el menú.
    if (!restauranteSlug) {
      console.warn("[RestaurantMenuPage] No hay slug de restaurante en la URL.");
      setError("Slug de restaurante no proporcionado en la URL.");
      setLoading(false);
      return;
    }

    const fetchMenu = async () => {
      console.log(`[RestaurantMenuPage] Iniciando obtención del menú para slug: ${restauranteSlug}`);
      try {
        setLoading(true); // Inicia el estado de carga
        setError(null); // Limpia errores previos

        // **Llama a la nueva función de la API**
        const menuData = await getRestaurantMenu(restauranteSlug);
        console.log("[RestaurantMenuPage] getRestaurantMenu retornó:", menuData);

        if (menuData) {
          // Asumiendo que la API devuelve una lista de productos directamente
          setMenuItems(menuData); // Setea los ítems del menú en el estado
        } else {
             // Si la API retorna null o vacío, se maneja como lista vacía
            setMenuItems([]);
             console.log("[RestaurantMenuPage] La obtención del menú retornó vacío o nulo.");
        }

      } catch (err) {
        console.error("[RestaurantMenuPage] Error al obtener el menú:", err);
        // Manejar errores.
        setError("Error al cargar el menú del restaurante.");
      } finally {
        setLoading(false); // Desactiva el estado de carga al finalizar
        console.log("[RestaurantMenuPage] Finalizada obtención del menú.");
      }
    };

    // Dispara la función de obtención del menú
    fetchMenu();

    // Dependencias del efecto: restauranteSlug para re-obtener si el slug cambia.
  }, [restauranteSlug]); // Asegúrate de tener las dependencias correctas aquí


  // --- Lógica de Renderizado ---

  // Mostrar estado de carga
  if (loading) {
    console.log("[RestaurantMenuPage] Renderizando Pantalla de Carga...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando menú...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error
  if (error) {
    console.log("[RestaurantMenuPage] Renderizando Pantalla de Error...");
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Error:</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no hay ítems en el menú (carga terminada, no error, lista vacía)
  if (menuItems.length === 0) {
     console.log("[RestaurantMenuPage] Renderizando Mensaje de Menú Vacío...");
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Información:</p>
          <p>No se encontraron ítems en el menú para este restaurante.</p>
           {/* Opcional: Botón para añadir nuevo producto */}
           {/* <Link href={`/dashboard/restaurantes/${restauranteSlug}/menu/crear`} className="mt-4 inline-block bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">Añadir Nuevo Producto</Link> */}
        </div>
      </div>
    );
  }

  // Mostrar la lista de ítems del menú
  console.log("[RestaurantMenuPage] Renderizando Lista del Menú...");
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl"> {/* Contenedor principal centrado */}

        {/* Botón para volver al panel principal si lo deseas */}
        <Link href={`/dashboard`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver al Panel
        </Link>

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Menú del Restaurante ({restauranteSlug})</h1>
      <h5 className="text-xl font-semibold text-gray-700 mb-4">Ítems del Menú: {menuItems.length}</h5>
      


      {/* Opcional: Botón para añadir nuevo producto */}
      {/* <div className="mb-6">
         <Link href={`/dashboard/restaurantes/${restauranteSlug}/menu/crear`} className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200">
             Añadir Nuevo Producto
         </Link>
      </div> */}


      {/* Lista de ítems del menú */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"> {/* Usa grid para mostrar ítems en columnas */}
           {menuItems.map(item => (
               // Usa item.id (o slug si es único) como clave única
               // Cada ítem podría ser un Link a la página de detalle/edición del producto
               // <Link key={item.id} href={`/dashboard/restaurantes/${restauranteSlug}/menu/${item.id}`}> {/* O item.slug si usas slug en la URL */}
               <div key={item.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden flex flex-col"> {/* Tarjeta para cada ítem */}
                   {/* Imagen del producto si existe */}
                   {item.imagen && (
                       <div className="relative h-40 w-full"> {/* Contenedor para imagen con tamaño fijo */}
                            {/* Usa el componente Image de next/image para optimización */}
                           <Image
                               src={`${process.env.NEXT_PUBLIC_API_URL}${item.imagen}`} // URL de la imagen del API
                               alt={`Imagen de ${item.nombre}`}
                               fill // La imagen llenará el contenedor
                               style={{ objectFit: 'cover' }} // Asegura que la imagen cubra el espacio sin distorsionarse
                               className="object-cover" // Clave de Tailwind si usas un div envolvente
                               sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // Ayuda a next/image a optimizar
                           />
                       </div>
                   )}

                   {/* Contenido del texto (nombre, precio, descripción, etc.) */}
                   <div className="p-4 flex-grow"> {/* Padding interno, flex-grow para ocupar espacio disponible */}
                       <h3 className="text-lg font-semibold text-gray-800 mb-1">{item.nombre}</h3> 
                       {item.categoria_details?.nombre && (
                            <p className="text-sm font-medium text-gray-600 mb-2">{item.categoria_details.nombre}</p> 
                       )}
                       {item.descripcion && (
                           <p className="text-gray-700 text-sm mb-2">{item.descripcion}</p> 
                       )}
                       {/* Puedes añadir aquí el estado (activo/disponible) si lo necesitas */}
                       {/* <p className={`text-sm font-semibold ${item.activo ? 'text-green-600' : 'text-red-600'}`}>{item.activo ? 'Activo' : 'Inactivo'}</p> */}
                   </div>

                    {/* Sección de Precio (abajo) */}
                    <div className="p-4 border-t border-gray-100 mt-auto"> {/* Borde superior, margen arriba, mt-auto para empujar abajo */}
                         <p className="text-xl font-bold text-primary">{item.precio ? parseFloat(item.precio).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : 'N/A'}</p> {/* Precio */}
                    </div>

                   {/* Opcional: Botones de acción como Editar, Eliminar */}
                    {/* <div className="p-4 border-t border-gray-100 flex justify-end gap-2">
                        <Link href={`/dashboard/restaurantes/${restauranteSlug}/menu/${item.id}/editar`} className="text-blue-600 hover:underline text-sm">Editar</Link>
                        <button className="text-red-600 hover:underline text-sm">Eliminar</button>
                    </div> */}

               </div>
               
           ))}
      </div>

    </div>
  );
}