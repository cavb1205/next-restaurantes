// app/dashboard/restaurantes/[slug]/ordenes/[orderId]/page.js
"use client"; // Este es un Client Component

import { useState, useEffect } from "react"; // Hooks de estado y efectos
import { useParams } from "next/navigation"; // Hook para acceder a los parámetros de la URL ([slug], [orderId])
import Link from "next/link"; // Para crear enlaces de navegación
// Importa la función para obtener los detalles de una orden
import { getOrderDetail, updateOrderStatus } from "@/app/services/apiService"; // <<-- Asegúrate de que esta ruta de importación sea correcta

export default function OrderDetailPage() {
  // Obtiene los parámetros de la URL.
  const params = useParams();
  const restauranteSlug = params.slug; // Slug del restaurante
  const orderId = params.orderId; // ID de la orden

  // Estado para los datos de la orden individual, carga y error
  const [order, setOrder] = useState(null); // Datos de la orden específica
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // Nuevos estados para la acción de actualizar estado
  const [updatingStatus, setUpdatingStatus] = useState(false); // Indica si se está actualizando el estado
  const [statusError, setStatusError] = useState(null); // Error específico de la actualización de estado

  // Efecto para obtener los detalles de la orden cuando el componente se monta o los parámetros de la URL cambian
  useEffect(() => {
    console.log("[OrderDetailPage] Efecto de carga de detalle de orden disparado.");

    if (!restauranteSlug || !orderId) {
      console.warn("[OrderDetailPage] Faltan parámetros en la URL (slug o orderId).");
      setError("Información de la orden incompleta en la URL.");
      setLoading(false);
      return;
    }

    const fetchOrderDetail = async () => {
      console.log(`[OrderDetailPage] Iniciando obtención de detalles para orden ${orderId} en restaurante ${restauranteSlug}`);
      try {
        setLoading(true); // Activa la carga
        setError(null); // Limpia errores previos
        setOrder(null); // Limpia datos de orden previos mientras carga (opcional, útil si navegas entre órdenes sin recargar)

        // Llama a la función de la API para obtener el detalle
        const orderData = await getOrderDetail(restauranteSlug, orderId); // Pasa ambos parámetros
        console.log("[OrderDetailPage] getOrderDetail retornó:", orderData);

        if (orderData) {
          setOrder(orderData); // Setea los detalles de la orden
        } else {
           // Si la API retorna null o vacío para un ID específico, asumimos que la orden no se encontró.
            setOrder(null);
             console.log(`[OrderDetailPage] La obtención del detalle de orden ${orderId} retornó vacío o nulo.`);
             // Setea un error para mostrar un mensaje claro de que la orden no fue encontrada.
             setError(`No se encontraron detalles para la orden con ID ${orderId}.`); // <<-- Mejoramos el mensaje de error para este caso
        }

      } catch (err) {
        console.error("[OrderDetailPage] Error al obtener detalles de orden:", err);
        // Manejar errores.
        setError(`Error al cargar los detalles de la orden ${orderId}.`);
      } finally {
        setLoading(false); // Desactiva la carga al finalizar
        console.log("[OrderDetailPage] Finalizada obtención de detalle de orden.");
      }
    };

    fetchOrderDetail();

    // Dependencias del efecto
  }, [restauranteSlug, orderId, getOrderDetail]); // Asegúrate de tener las dependencias correctas



  // --- Nueva función para actualizar el estado de la orden ---
  const handleStatusUpdate = async (newStatus) => {
    console.log(`[OrderDetailPage] Intentando cambiar estado de orden ${orderId} a ${newStatus}`);
    if (!order || !restauranteSlug || updatingStatus) {
        console.warn("[OrderDetailPage] No se puede actualizar estado: Faltan datos de orden/slug o ya está actualizando.");
        return; // No hacer nada si no hay orden cargada, slug, o ya estamos actualizando
    }

    try {
        setUpdatingStatus(true); // Activa el estado de actualización
        setStatusError(null); // Limpia errores de actualización previos

        // ** Llama a la nueva función de la API para actualizar el estado **
        // Necesitarás crear la función updateOrderStatus en apiService.js
        const updatedOrderData = await updateOrderStatus(restauranteSlug, orderId, newStatus);
        console.log("[OrderDetailPage] updateOrderStatus retornó:", updatedOrderData);

        // ** ACTUALIZAR ESTADO EN EL FRONTEND **
        // Opción 1: Actualizar el objeto 'order' localmente con los datos retornados por la API
        // Esto es más rápido ya que no requiere otra petición GET. Asume que el endpoint PATCH retorna la orden actualizada.
        setOrder(updatedOrderData);
        console.log("[OrderDetailPage] Estado de orden actualizado localmente.");

        // Opción 2 (Alternativa): Re-obtener los detalles completos de la orden
        // Esto asegura que tienes la información más fresca, pero es más lento (dos peticiones).
        // await fetchOrderDetail(); // Llama a la función que ya tenemos para obtener detalles

    } catch (err) {
        console.error("[OrderDetailPage] Error al actualizar estado de orden:", err);
        setStatusError("Error al actualizar el estado de la orden."); // Setea el error de la acción
    } finally {
        setUpdatingStatus(false); // Desactiva el estado de actualización
        console.log("[OrderDetailPage] Finalizado intento de actualizar estado.");
    }
};
  // --- Lógica de Renderizado: Muestra diferente UI según el estado ---

  // Mostrar estado de carga
  if (loading) {
     console.log("[OrderDetailPage] Renderizando Pantalla de Carga...");
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando detalles de la orden...</p>
        </div>
      </div>
    );
  }

  // Mostrar estado de error general (ej: error de red al hacer la petición)
  if (error && !order) { // Mostrar error si hay error Y no tenemos datos de orden (para no ocultar datos si el error es parcial)
     console.log("[OrderDetailPage] Renderizando Pantalla de Error General...");
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">Error:</p>
          <p>{error}</p>
           {/* Botón para volver a la lista */}
          <Link href={`/dashboard/restaurantes/${restauranteSlug}/ordenes`} className="mt-4 inline-block text-blue-600 hover:underline">Volver a la lista de órdenes</Link>
        </div>
      </div>
    );
  }

   // Mostrar mensaje si la orden no fue encontrada específicamente (error setea un mensaje específico, o order es null)
   if (!order && !loading && error) { // Si no está cargando, no hay objeto order, pero sí hay un error (indicando que no se encontró)
         console.log("[OrderDetailPage] Renderizando Mensaje de Orden No Encontrada...");
        return (
          <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
              <p className="font-semibold text-lg mb-2">Información:</p>
              {/* Usa el mensaje de error seteado si es específico de no encontrado, o uno genérico */}
              <p>{error || `No se encontraron detalles para la orden con ID ${orderId}.`}</p>
               {/* Botón para volver a la lista */}
              <Link href={`/dashboard/restaurantes/${restauranteSlug}/ordenes`} className="mt-4 inline-block text-blue-600 hover:underline">Volver a la lista de órdenes</Link>
            </div>
          </div>
        );
   }


  // Si llegamos aquí, los datos se cargaron correctamente y tenemos la orden.
  // Renderiza la interfaz con los detalles de la orden.
  console.log("[OrderDetailPage] Renderizando Detalles de Orden. Datos de orden:", order);
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl"> {/* Contenedor principal centrado */}
        {/* Botón para volver a la lista de órdenes */}
        <Link href={`/dashboard/restaurantes/${restauranteSlug}/ordenes`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver a la lista de órdenes
        </Link>

      {/* Título principal con el ID de la orden */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Detalle de Orden #{orderId}</h1>

      {/* ** SECCIÓN DE INFORMACIÓN BÁSICA DE LA ORDEN ** */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Información de la Orden</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid para pares clave-valor */}
             {/* ID de Orden */}
            <p><span className="font-semibold text-gray-700">ID de Orden:</span> {order.id}</p>

            {/* Estado de la Orden con Estilo de Insignia */}
            <p>
                 <span className="font-semibold text-gray-700">Estado:</span>
                 {order.estado ? (
                      <span className={`ml-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                           order.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                           order.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                           order.estado === 'en_camino' ? 'bg-purple-100 text-purple-800' :
                           order.estado === 'entregada' ? 'bg-green-100 text-green-800' :
                           order.estado === 'cancelada' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                       }`}>
                        {order.estado.replace('_', ' ')}
                      </span>
                 ) : 'N/A'}
            </p>

            {/* Total de la Orden */}
            <p><span className="font-semibold text-gray-700">Total:</span> {order.total ? parseFloat(order.total).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : 'N/A'}</p>

            {/* Fecha de Creación */}
            <p><span className="font-semibold text-gray-700">Fecha de Creación:</span> {order.created_at ? new Date(order.created_at).toLocaleString() : 'N/A'}</p>

             {/* Fecha de Última Actualización */}
            <p><span className="font-semibold text-gray-700">Última Actualización:</span> {order.updated_at ? new Date(order.updated_at).toLocaleString() : 'N/A'}</p>

            {/* Instrucciones Especiales */}
            {order.instrucciones_especiales && (
                 <div className="md:col-span-2"> {/* Ocupa las dos columnas en pantallas medias y grandes */}
                      <p><span className="font-semibold text-gray-700">Instrucciones Especiales:</span> {order.instrucciones_especiales}</p>
                 </div>
             )}
        </div>
      </div>


      {/* ** SECCIÓN DE INFORMACIÓN DEL CLIENTE ** */}
       {(order.cliente_nombre || order.cliente_telefono || order.cliente_email || order.direccion_envio) ? (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
                 <h2 className="text-xl font-semibold text-gray-800 mb-4">Información del Cliente</h2>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid para pares clave-valor */}
                     {order.cliente_nombre && <p><span className="font-semibold text-gray-700">Nombre:</span> {order.cliente_nombre}</p>}
                     {order.cliente_telefono && <p><span className="font-semibold text-gray-700">Teléfono:</span> {order.cliente_telefono}</p>}
                     {order.cliente_email && <p><span className="font-semibold text-gray-700">Email:</span> {order.cliente_email}</p>}
                     {order.direccion_envio && (
                         <div className="md:col-span-2">
                             <p><span className="font-semibold text-gray-700">Dirección de Envío:</span> {order.direccion_envio}</p>
                         </div>
                     )}
                      {/* Puedes añadir aquí información de order.usuario si no es null y tu serializer lo incluye */}
                 </div>
            </div>
       ) : null}


      {/* ** SECCIÓN DE ÍTEMS DE LA ORDEN ** */}
      {order.items && order.items.length > 0 ? (
           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Productos</h2>
              <ul className="divide-y divide-gray-200"> {/* Lista con separadores */}
                   {/* Mapea sobre el array 'items' */}
                   {order.items.map(item => (
                       // Usa item.id como clave única
                       <li key={item.id} className="py-4 flex justify-between items-center"> {/* Estilo del ítem */}
                           <div>
                               {/* Usa los detalles del producto anidado (producto_details) */}
                                <p className="font-semibold text-gray-700">{item.cantidad} x {item.producto_details?.nombre || 'Producto Desconocido'}</p> {/* Muestra cantidad y nombre del producto */}
                                {/* Opcional: Mostrar variaciones o extras si existen en item.producto_details o item mismo */}
                                {/* {item.variaciones && item.variaciones.map(v => <p key={v.id} className="text-sm text-gray-600 ml-4">- {v.nombre}</p>)} */}
                           </div>
                           {/* Muestra el subtotal del ítem formateado */}
                           <p className="text-gray-600">{parseFloat(item.subtotal || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}</p>
                       </li>
                   ))}
              </ul>
          </div>
      ) : null}


       {/* ** SECCIÓN DE MÉTODO DE PAGO Y ENVÍO ** */}
        {(order.metodo_pago_details || order.envio_details) ? (
            <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Pago y Envío</h2>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {order.metodo_pago_details && (
                        <div>
                            <p><span className="font-semibold text-gray-700">Método de Pago:</span> {order.metodo_pago_details.tipo ? order.metodo_pago_details.tipo.replace('_', ' ') : 'N/A'}</p> {/* Asume tipo es string o similar */}
                            {order.metodo_pago_details.descripcion && <p className="text-sm text-gray-600">{order.metodo_pago_details.descripcion}</p>}
                            {/* Añadir otros detalles de pago si tu API los incluye */}
                        </div>
                    )}
                    {order.envio_details && (
                         <div>
                             <p><span className="font-semibold text-gray-700">Método de Envío:</span> {order.envio_details.nombre || 'N/A'}</p>
                             <p><span className="font-semibold text-gray-700">Costo de Envío:</span> {order.envio_details.precio ? parseFloat(order.envio_details.precio).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : 'Gratis'}</p>
                             {/* Añadir otros detalles de envío */}
                         </div>
                     )}
               </div>
           </div>
       ) : null}


      {/* ** SECCIÓN DE BOTONES DE ACCIÓN ** */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
           <h2 className="text-xl font-semibold text-gray-800 mb-4">Acciones</h2>

           {/* Muestra spinner o mensaje si se está actualizando el estado */}
           {updatingStatus && (
               <div className="flex items-center mb-4 text-blue-600">
                    <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-600 mr-3"></div>
                    <span>Actualizando estado...</span>
               </div>
           )}

            {/* Muestra error si ocurrió uno al actualizar estado */}
           {statusError && (
                <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">
                    <p>{statusError}</p>
                </div>
           )}

            {/* --- Botones para cambiar estado (Condicionales según el estado actual) --- */}
            <div className="flex flex-wrap gap-4">

                {/* Botón: Marcar En Proceso (visible solo si está 'pendiente') */}
                {order.estado === 'pendiente' && (
                     <button
                         onClick={() => handleStatusUpdate('en_proceso')} // Llama a la función con el nuevo estado 'en_proceso'
                         className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={updatingStatus} // Deshabilita el botón si ya se está actualizando otra acción
                     >
                         Marcar En Proceso
                     </button>
                )}

                {/* Botón: Marcar En Camino (visible solo si está 'en_proceso' - Típicamente para envío) */}
                {order.estado === 'en_proceso' && order.envio_details?.nombre?.toLowerCase() === 'delivery' && ( // Muestra si es envío
                     <button
                         onClick={() => handleStatusUpdate('en_camino')} // Llama a la función con el nuevo estado 'en_camino'
                         className="px-4 py-2 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                         disabled={updatingStatus}
                     >
                         Marcar En Camino
                     </button>
                )}

                {/* Botón: Marcar Lista para Retiro (visible solo si está 'en_proceso' - Típicamente para retiro) */}
                 {order.estado === 'en_proceso' && order.envio_details?.nombre?.toLowerCase() === 'retiro en local' && ( // Muestra si es retiro
                      <button
                          onClick={() => handleStatusUpdate('lista_retiro')} // Llama a la función con el nuevo estado 'lista_retiro'
                          className="px-4 py-2 bg-yellow-600 text-white font-semibold rounded-lg shadow-md hover:bg-yellow-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingStatus}
                      >
                          Marcar Lista para Retiro
                      </button>
                 )}

                 {/* Botón: Marcar Entregada (visible si está 'en_camino' O 'lista_retiro') */}
                  {(order.estado === 'en_camino' || order.estado === 'lista_retiro') && (
                       <button
                          onClick={() => handleStatusUpdate('entregada')} // Llama a la función con el nuevo estado 'entregada'
                          className="px-4 py-2 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingStatus}
                       >
                           Marcar Entregada
                       </button>
                  )}

                {/* Botón: Cancelar Orden (visible si no está ya cancelada o entregada) */}
                {order.estado !== 'cancelada' && order.estado !== 'entregada' && (
                    <button
                        onClick={() => handleStatusUpdate('cancelada')} // Llama a la función con el nuevo estado 'cancelada'
                        className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={updatingStatus}
                    >
                        Cancelar Orden
                    </button>
                )}

                 {/* Opcional: Botón para reabrir ordenes canceladas/entregadas (si tu lógica lo permite) */}
                 {/* {(order.estado === 'cancelada' || order.estado === 'entregada') && (
                      <button
                          onClick={() => handleStatusUpdate('pendiente')} // O a un estado de "reabierta" si existe
                          className="px-4 py-2 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={updatingStatus}
                      >
                          Reabrir Orden
                      </button>
                 )} */}

            </div>

       </div>


      {/* Nota: La información de restaurante_details no se muestra por defecto aquí,
               ya que ya estamos en la página de ese restaurante, pero está disponible en el objeto 'order'. */}

    </div>
  );
}