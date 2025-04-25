"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
// Asegúrate de que getOrden hace el fetch a tu endpoint de detalle de orden por ID (por ejemplo, /api/ordenes/{id}/)
import { getOrden } from "@/app/services/orden";
import Link from "next/link";

export default function ConfirmacionPage() {
  const { id } = useParams(); // Obtiene el ID de la orden de los parámetros de la URL
  const router = useRouter();
  const [orden, setOrden] = useState(null); // Estado para almacenar la orden
  const [loading, setLoading] = useState(true); // Estado de carga
  const [error, setError] = useState(null); // Estado de error

  // Efecto para cargar la orden cuando el ID cambia
  useEffect(() => {
    const fetchOrden = async () => {
      try {
        // Si no hay ID en la URL, no hacemos nada
        if (!id) {
             setLoading(false); // Terminar carga si no hay ID
             setError("ID de pedido no proporcionado."); // O establecer un error
             return;
        }

        setLoading(true); // Indicar que está cargando
        // Llama a tu servicio backend para obtener la orden por ID
        const data = await getOrden(id);

        // Asume que getOrden devuelve el objeto de orden si es exitoso
        // o un objeto con { error: mensaje } si falla.
        if (data && data.error) {
          // Si el servicio devuelve un error, lanzar una excepción
          throw new Error(data.error);
        }

        // Guarda el objeto de orden recibido en el estado
        setOrden(data);

      } catch (error) {
        console.error("Error al cargar la orden:", error);
        // Establecer mensaje de error si falla la carga
        setError(
          "No se pudo cargar la información de tu pedido. Inténtalo nuevamente."
        );
      } finally {
        // Siempre establecer loading a false al finalizar
        setLoading(false);
      }
    };

    fetchOrden(); // Ejecutar la función de carga

  }, [id]); // Ejecutar este efecto cada vez que el ID de la URL cambie


  // --- Renderizado condicional según el estado ---

  // Mostrar spinner de carga
  if (loading) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando información del pedido...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensaje de error si ocurrió uno
  if (error) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-red-700 mb-2">¡Ups! Algo salió mal</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  // Mostrar mensaje si no se encontró la orden (cuando data es null/undefined y no hubo error explícito)
   if (!orden) {
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <h2 className="text-2xl font-bold text-yellow-700 mb-2">Pedido no encontrado</h2>
          <p className="text-yellow-600 mb-6">
            No pudimos encontrar la información del pedido solicitado.
          </p>
          <Link
            href="/"
            className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }


  // --- Renderizar los detalles completos de la orden ---
  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="text-center mb-8">
          {/* Icono de éxito */}
          <div className="w-16 h-16 bg-green-100 rounded-full mx-auto flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-primary mt-4">¡Pedido realizado con éxito!</h1>
          <p className="text-gray-600 mt-2">
            Tu pedido ha sido recibido y está siendo procesado.
          </p>
        </div>

        <div className="border-t border-gray-100 pt-6">
          {/* Número de pedido */}
          <h2 className="text-xl font-semibold text-primary mb-4">
            Resumen del pedido #{orden.id}
          </h2>

          <div className="space-y-6">
            {/* Información del restaurante (usando restaurante_details) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Restaurante</h3>
              <p className="text-gray-700 capitalize">{orden.restaurante_details?.nombre || 'No disponible'}</p>
            </div>

            {/* Información de contacto y entrega */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Información de contacto y entrega</h3>
              <div className="space-y-1 text-gray-700">
                {/* Muestra la información de contacto según si hay un usuario registrado o es anónimo */}
                {orden.usuario ? (
                  <>
                    {/* Si la orden tiene un usuario registrado (el campo usuario no es null) */}
                    <p>Usuario registrado (ID: {orden.usuario})</p>
                    {/* Si tuvieras el serializador de usuario anidado en OrdenSerializer, podrías mostrar más detalles: */}
                    {/* <p>Nombre: {orden.usuario_details?.first_name} {orden.usuario_details?.last_name}</p> */}
                    {/* <p>Email: {orden.usuario_details?.email}</p> */}
                  </>
                ) : (
                  <>
                    {/* Si la orden es anónima (el campo usuario es null), muestra los nuevos campos de cliente anónimo */}
                    {/* Usamos || 'No proporcionado' para manejar casos donde el campo sea nulo en la BD */}
                    <p>Nombre: {orden.cliente_nombre || 'No proporcionado'}</p>
                    <p>Teléfono: {orden.cliente_telefono || 'No proporcionado'}</p>
                    <p>Email: {orden.cliente_email || 'No proporcionado'}</p>
                  </>
                )}
                {/* Mostrar la dirección de envío que sí está en el JSON para ambos tipos de orden */}
                <p>Dirección de envío: {orden.direccion_envio}</p>
                {/* Mostrar instrucciones especiales si existen */}
                {orden.instrucciones_especiales && (
                  <p className="text-gray-600 text-sm mt-1">
                    Instrucciones especiales: {orden.instrucciones_especiales}
                  </p>
                )}
              </div>
            </div>

            {/* Productos (usando items e item.producto_details) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Productos</h3>
              <div className="space-y-3">
                {/* Iterar sobre orden.items (la lista de detalles de orden) */}
                {/* Usamos item.id como key si existe, o index como fallback (item.id debería existir si se guarda) */}
                {orden.items?.map((item, index) => (
                  <div key={item.id || index} className="flex justify-between">
                    <div>
                      {/* Cantidad está en el ítem */}
                      <span className="font-medium text-gray-900">{item.cantidad}x</span>
                       {/* Nombre del producto está en item.producto_details */}
                      <span className="ml-2 text-gray-600">{item.producto_details?.nombre}</span>
                    </div>
                    <span className="text-primary font-medium">
                      {/* Calcular el total por ítem usando el precio del producto_details */}
                      {(parseFloat(item.producto_details?.precio || 0) * item.cantidad).toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Método de envío (usando envio_details) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Método de envío</h3>
              <div className="flex justify-between">
                {/* Nombre del método de envío está en envio_details */}
                <span>{orden.envio_details?.nombre || 'No especificado'}</span>
                <span className="text-primary font-medium">
                   {/* Precio del envío está en envio_details */}
                  {parseFloat(orden.envio_details?.precio || 0) > 0
                    ? parseFloat(orden.envio_details?.precio || 0).toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })
                    : "Gratis"}
                </span>
              </div>
            </div>

            {/* Método de pago (usando metodo_pago_details) */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Método de pago</h3>
              {/* Tipo del método de pago está en metodo_pago_details */}
              <p className="text-gray-700 capitalize">{orden.metodo_pago_details?.tipo || 'No especificado'}</p>
            </div>

            {/* Totales */}
            <div className="bg-primary/5 p-4 rounded-lg">
              {/* Si necesitas mostrar el subtotal de ítems antes del envío, puedes calcularlo aquí en frontend */}
               {/* Ejemplo de cálculo de subtotal de ítems: */}
               {orden.items && (
                 <div className="flex justify-between mb-2">
                   <span className="text-gray-700">Subtotal Productos</span>
                   <span className="font-medium">
                     {orden.items.reduce((sum, item) => sum + parseFloat(item.producto_details?.precio || 0) * item.cantidad, 0).toLocaleString("es-CL", {
                       style: "currency",
                       currency: "CLP",
                     })}
                   </span>
                 </div>
               )}

              {/* Costo de Envío */}
               {orden.envio_details && (
                 <div className="flex justify-between mb-2">
                    <span className="text-gray-700">Costo Envío</span>
                     <span className="font-medium">
                       {parseFloat(orden.envio_details?.precio || 0).toLocaleString("es-CL", {
                         style: "currency",
                         currency: "CLP",
                       })}
                    </span>
                 </div>
               )}

              {/* Total Final */}
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-800">Total</span>
                 {/* Total está en el objeto orden principal */}
                <span className="text-primary">
                  {parseFloat(orden.total || 0).toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </span>
              </div>
            </div>

            {/* Estado del pedido */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Estado del pedido</h3>
              {/* Estado está en el objeto orden principal */}
              <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium text-sm capitalize">
                {orden.estado || 'pendiente'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botón para volver al inicio */}
      <div className="text-center">
        <Link
          href="/"
          className="bg-primary hover:bg-primary/90 text-white font-medium py-2 px-6 rounded-lg transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}