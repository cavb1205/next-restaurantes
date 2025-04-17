"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getNegocioEnvios } from "@/app/services/negocio";
import { createOrden } from "@/app/services/orden";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ onSubmit }) {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const negocio = cart[0]?.negocio;
  const [envios, setEnvios] = useState([]);
  const [metodoPagos, setMetodoPagos] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEnvios = async () => {
      if (negocio?.id) {
        try {
          setIsLoading(true);
          const response = await getNegocioEnvios(negocio.id);
          console.log("response", response);

          if (response) {
            setEnvios(response[0].envios);
            setMetodoPagos(response[0].metodo_pagos);
            setIsLoading(false);
          } else {
            console.warn("No se encontraron métodos de envío");
            setEnvios([]);
            setIsLoading(false);
          }
        } catch (error) {
          console.error("Error al obtener los envíos:", error);
          setEnvios([]);
          setIsLoading(false);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEnvios();
  }, []);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    referencia: "",
    metodoPago: "efectivo",
    metodoEnvio: "",
    notasAdicionales: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      let costoEnvio = 0;
      let envioSeleccionado = null;

      if (formData.metodoEnvio && envios) {
        envioSeleccionado = envios.find(
          (envio) => envio.id === parseInt(formData.metodoEnvio)
        );
        costoEnvio = envioSeleccionado?.precio || 0;
      }

      const total = getCartTotal() + costoEnvio;

      // Preparar datos para la API
      const ordenData = {
        cliente: {
          nombre: formData.nombre,
          telefono: formData.telefono,
          email: formData.email,
        },
        direccion: formData.direccion,
        referencia: formData.referencia,
        metodoPago: formData.metodoPago,
        metodoEnvio: envioSeleccionado
          ? {
              id: envioSeleccionado.id,
              nombre: envioSeleccionado.nombre,
              precio: envioSeleccionado.precio,
            }
          : null,
        notasAdicionales: formData.notasAdicionales,
        negocio: {
          id: negocio.id,
          nombre: negocio.nombre,
        },
        productos: cart.map((item) => ({
          id: item.id,
          nombre: item.nombre,
          precio: item.precio,
          cantidad: item.quantity,
        })),
        costoEnvio,
        subtotal: getCartTotal(),
        total,
        estado: "pendiente",
        fechaCreacion: new Date().toISOString(),
      };
      console.log(ordenData);

      // Enviar a la API
      const response = await createOrden(ordenData);

      if (response.error) {
        throw new Error(response.error);
      }

      // Limpiar carrito
      clearCart();

      // Redireccionar a la página de confirmación
      router.push(`/confirmacion/${response.id}`);

      // También llamar al onSubmit para compatibilidad
      if (onSubmit) {
        onSubmit({
          ...formData,
          cart,
          negocio,
          costoEnvio,
          total,
          ordenId: response.id,
        });
      }
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      setError(
        "Hubo un error al procesar tu pedido. Por favor intenta de nuevo."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calcular el total incluyendo el envío
  const totalConEnvio = () => {
    if (!formData.metodoEnvio || !envios) return getCartTotal();

    const envioSeleccionado = envios.find(
      (envio) => envio.id === parseInt(formData.metodoEnvio)
    );
    return getCartTotal() + (envioSeleccionado?.precio || 0);
  };

  // Si no hay elementos en el carrito, mostrar mensaje
  if (cart.length === 0) {
    return (
      <div className="text-center py-8">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Tu carrito está vacío
        </h2>
        <p className="text-gray-600 mb-4">
          Agrega productos a tu carrito antes de realizar un pedido.
        </p>
        <button
          onClick={() => router.push("/")}
          className="bg-primary text-white py-2 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
        >
          Volver a la tienda
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información del Negocio */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Información del Pedido
        </h2>
        <div className="space-y-2">
          <p className="text-secondary capitalize">
            <span className="font-medium">Restaurante:</span>{" "}
            {negocio?.nombre || "No disponible"}
          </p>
          <p className="text-secondary capitalize">
            <span className="font-medium">Dirección del restaurante:</span>{" "}
            {negocio?.direccion || "No disponible"}
          </p>
        </div>
      </div>

      {/* Información Personal */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Información Personal
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="nombre"
              className="block text-sm font-medium text-gray-700"
            >
              Nombre completo
            </label>
            <input
              type="text"
              id="nombre"
              name="nombre"
              required
              value={formData.nombre}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md p-1 border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="telefono"
              className="block text-sm font-medium text-gray-700"
            >
              Teléfono
            </label>
            <input
              type="tel"
              id="telefono"
              name="telefono"
              required
              value={formData.telefono}
              onChange={handleChange}
              className="mt-1 block w-full p-1 rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Correo electrónico
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md p-1 border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>
        </div>
      </div>

      {/* Método de Envío */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Método de Envío
        </h2>
        <div className="space-y-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="animate-pulse flex items-center space-x-4 p-3"
                >
                  <div className="h-4 w-4 bg-gray-200 rounded-full"></div>
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : envios.length > 0 ? (
            envios
              .filter((envio) => envio.estado)
              .map((envio) => (
                <div
                  key={envio.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    id={`envio-${envio.id}`}
                    name="metodoEnvio"
                    value={envio.nombre}
                    required
                    checked={formData.metodoEnvio === envio.nombre}
                    onChange={handleChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                  />
                  <label
                    htmlFor={`envio-${envio.id}`}
                    className="flex flex-1 justify-between text-sm font-medium text-secondary"
                  >
                    <span>{envio.nombre}</span>
                    <span className="text-primary font-semibold">
                      {envio.precio === 0
                        ? "Gratis"
                        : envio.precio.toLocaleString("es-CL", {
                            style: "currency",
                            currency: "CLP",
                          })}
                    </span>
                  </label>
                </div>
              ))
          ) : (
            <div className="text-center py-4">
              <p className="text-secondary">
                No hay métodos de envío disponibles en este momento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Dirección de Envío */}

      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Dirección de Envío
        </h2>
        <div className="space-y-4">
          <div>
            <label
              htmlFor="direccion"
              className="block text-sm font-medium text-secondary"
            >
              Dirección
            </label>
            <input
              type="text"
              id="direccion"
              name="direccion"
              required
              value={formData.direccion}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md p-1 border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="referencia"
              className="block text-sm font-medium text-secondary"
            >
              Referencia (opcional)
            </label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md p-1 border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              placeholder="Ej: Casa color azul, cerca del parque"
            />
          </div>
        </div>
      </div>

      {/* Método de Pago */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Método de Pago
        </h2>
        <div className="space-y-4">
          {metodoPagos.length > 0 ? (
            metodoPagos.map((metodoPago) => (
              <div key={metodoPago.id} className="flex items-center space-x-4">
                <input
                  type="radio"
                  id={metodoPago.id}
                  name="metodoPago"
                  value={metodoPago.nombre}
                  checked={formData.metodoPago === metodoPago.nombre}
                  onChange={handleChange}
                  className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                />
                <label
                  htmlFor={metodoPago.id}
                  className="text-sm font-medium text-secondary"
                >
                  {metodoPago.nombre}
                </label>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-secondary">
                No hay métodos de pago disponibles en este momento
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Notas Adicionales */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Notas Adicionales
        </h2>
        <div>
          <textarea
            id="notasAdicionales"
            name="notasAdicionales"
            rows={3}
            value={formData.notasAdicionales}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md p-1 border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            placeholder="Instrucciones especiales para la entrega..."
          />
        </div>
      </div>

      {/* Resumen del Pedido */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Resumen del Pedido
        </h2>
        <div className="space-y-4">
          <div className="border-t border-b border-gray-200 py-4">
            {cart.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center py-2"
              >
                <div className="flex items-center">
                  <span className="font-medium text-gray-900">
                    {item.quantity}x
                  </span>
                  <span className="ml-2 text-gray-600">{item.nombre}</span>
                </div>
                <span className="text-primary font-medium">
                  {(item.precio * item.quantity).toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })}
                </span>
              </div>
            ))}
          </div>

          {/* Mostrar costo de envío si está seleccionado */}
          {formData.metodoEnvio && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Envío</span>
              <span className="text-primary font-medium">
                {(
                  envios.find(
                    (envio) => envio.id === parseInt(formData.metodoEnvio)
                  )?.precio || 0
                ).toLocaleString("es-CL", {
                  style: "currency",
                  currency: "CLP",
                })}
              </span>
            </div>
          )}

          <div className="flex justify-between items-center text-lg font-semibold">
            <span>Total</span>
            <span className="text-primary">
              {totalConEnvio().toLocaleString("es-CL", {
                style: "currency",
                currency: "CLP",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Mostrar error si existe */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          {error}
        </div>
      )}

      {/* Botón de Enviar */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={`w-full ${
          isSubmitting ? "bg-gray-400" : "bg-primary hover:bg-primary/90"
        } text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 flex justify-center items-center`}
      >
        {isSubmitting ? (
          <>
            <svg
              className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              ></path>
            </svg>
            Procesando...
          </>
        ) : (
          "Confirmar Pedido"
        )}
      </button>
    </form>
  );
}
