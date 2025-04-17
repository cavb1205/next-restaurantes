"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getOrden } from "@/app/services/orden";
import Link from "next/link";

export default function ConfirmacionPage() {
  const { id } = useParams();
  const router = useRouter();
  const [orden, setOrden] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchOrden = async () => {
      try {
        if (!id) return;
        
        setLoading(true);
        const data = await getOrden(id);
        
        if (data.error) {
          throw new Error(data.error);
        }
        
        setOrden(data);
      } catch (error) {
        console.error("Error al cargar la orden:", error);
        setError("No se pudo cargar la información de tu pedido. Inténtalo nuevamente.");
      } finally {
        setLoading(false);
      }
    };

    fetchOrden();
  }, [id]);

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

  return (
    <div className="container mx-auto py-10 px-4 max-w-4xl">
      <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-6 mb-8">
        <div className="text-center mb-8">
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
          <h2 className="text-xl font-semibold text-primary mb-4">
            Resumen del pedido #{id}
          </h2>
          
          <div className="space-y-6">
            {/* Información del restaurante */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Restaurante</h3>
              <p className="text-gray-700 capitalize">{orden.negocio?.nombre || 'No disponible'}</p>
            </div>
            
            {/* Información del cliente */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Información de contacto</h3>
              <div className="space-y-1 text-gray-700">
                <p>Nombre: {orden.cliente?.nombre}</p>
                <p>Teléfono: {orden.cliente?.telefono}</p>
                <p>Email: {orden.cliente?.email}</p>
              </div>
            </div>
            
            {/* Dirección de entrega */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Dirección de entrega</h3>
              <p className="text-gray-700">{orden.direccion}</p>
              {orden.referencia && (
                <p className="text-gray-600 text-sm mt-1">
                  Referencia: {orden.referencia}
                </p>
              )}
            </div>
            
            {/* Productos */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Productos</h3>
              <div className="space-y-3">
                {orden.productos?.map((producto, index) => (
                  <div key={index} className="flex justify-between">
                    <div>
                      <span className="font-medium">{producto.cantidad}x </span>
                      <span>{producto.nombre}</span>
                    </div>
                    <span className="text-primary font-medium">
                      {(producto.precio * producto.cantidad).toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Método de envío */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Método de envío</h3>
              <div className="flex justify-between">
                <span>{orden.metodoEnvio?.nombre || 'No especificado'}</span>
                <span className="text-primary font-medium">
                  {orden.costoEnvio > 0 
                    ? orden.costoEnvio.toLocaleString("es-CL", {
                        style: "currency",
                        currency: "CLP",
                      })
                    : "Gratis"}
                </span>
              </div>
            </div>
            
            {/* Método de pago */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Método de pago</h3>
              <p className="text-gray-700 capitalize">{orden.metodoPago}</p>
            </div>
            
            {/* Totales */}
            <div className="bg-primary/5 p-4 rounded-lg">
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Subtotal</span>
                <span className="font-medium">
                  {orden.subtotal.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-gray-700">Envío</span>
                <span className="font-medium">
                  {orden.costoEnvio.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2 mt-2">
                <span className="text-gray-800">Total</span>
                <span className="text-primary">
                  {orden.total.toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </span>
              </div>
            </div>
            
            {/* Estado del pedido */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-800 mb-2">Estado del pedido</h3>
              <div className="inline-block px-3 py-1 rounded-full bg-yellow-100 text-yellow-800 font-medium text-sm capitalize">
                {orden.estado || 'pendiente'}
              </div>
            </div>
          </div>
        </div>
      </div>
      
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