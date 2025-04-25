"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getNegocioId } from "@/app/services/negocio";
import { createOrden } from "@/app/services/orden";
import { useRouter } from "next/navigation";

export default function CheckoutForm({ onSubmit }) {
  const { cart, getCartTotal, clearCart } = useCart();
  const router = useRouter();
  const negocio = cart[0]?.restaurante;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [restaurante, setRestaurante] = useState(null);

  useEffect(() => {
    const fetchNegocio = async () => {
      if (negocio) {
        try {
          setIsLoading(true);
          const response = await getNegocioId(negocio);

          setRestaurante(response);
          setIsLoading(false);
        } catch (error) {
          setError("Error al cargar la información del negocio.");
          setIsLoading(false);
        }
      }
    };

    fetchNegocio();
  }, []);

  const [formData, setFormData] = useState({
    nombre: "",
    telefono: "",
    email: "",
    direccion: "",
    referencia: "",
    metodoPago: null,
    metodoEnvio: null,
    notasAdicionales: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      // Usa parseInt() solo si el nombre del campo es metodoEnvio o metodoPago
      [name]:
        name === "metodoEnvio" || name === "metodoPago"
          ? parseInt(value, 10)
          : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Asegurar de que los campos requeridos estén llenos (puedes añadir más validación)
    if (
      !formData.nombre ||
      !formData.telefono ||
      !formData.direccion ||
      formData.metodoPago === null ||
      formData.metodoEnvio === null
    ) {
      setError(
        "Por favor, completa todos los campos requeridos (Nombre, Teléfono, Dirección, Método de Pago, Método de Envío)."
      );
      setIsSubmitting(false);
      return;
    }

    // Asegurarse de que haya productos en el carrito
    if (cart.length === 0) {
      setError("Tu carrito está vacío.");
      setIsSubmitting(false);
      return;
    }

    try {
      // Preparar datos para la API
      const ordenData = {
        cliente_nombre: formData.nombre, // <-- Añade este mapeo
        cliente_telefono: formData.telefono, // <-- Añade este mapeo
        cliente_email: formData.email, // <-- Añade este mapeo
        direccion_envio: formData.direccion,
        referencia: formData.referencia,
        metodo_pago: formData.metodoPago,
        envio: formData.metodoEnvio,
        notasAdicionales: formData.notasAdicionales,
        restaurante: restaurante.id,
        items: cart.map((item) => ({
          producto: item.id,
          cantidad: item.quantity,
        })),
      };
      

      // Enviar a la API
      const response = await createOrden(ordenData);
      console.log("Respuesta de la API:", response);

      if (response.error) {
        throw new Error(response.error);
      }

      // Limpiar carrito
      clearCart();

      // Redireccionar a la página de confirmación
      router.push(`/confirmacion/${response.id}`);

      // // También llamar al onSubmit para compatibilidad
      // if (onSubmit) {
      //   onSubmit({
      //     ...formData,
      //     cart,
      //     negocio,
      //     costoEnvio,
      //     total,
      //     ordenId: response.id,
      //   });
      // }
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
    if (!formData.metodoEnvio) return getCartTotal();

    const envioSeleccionado = restaurante?.envios.find(
      (envio) => envio.id === parseInt(formData.metodoEnvio)
    );
    return getCartTotal() + parseInt(envioSeleccionado?.precio || 0);
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
            {restaurante?.nombre || "No disponible"}
          </p>
          <p className="text-secondary capitalize">
            <span className="font-medium">Dirección del restaurante:</span>{" "}
            {restaurante?.direccion || "No disponible"}
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
          ) : restaurante?.envios.length > 0 ? (
            restaurante.envios
              .filter((envio) => envio.estado == "activo")
              .map((envio) => (
                <div
                  key={envio.id}
                  className="flex items-center space-x-4 p-3 hover:bg-gray-50 rounded-lg transition-colors"
                >
                  <input
                    type="radio"
                    id={`envio-${envio.id}`}
                    name="metodoEnvio"
                    value={parseInt(envio.id)}
                    required
                    checked={formData.metodoEnvio === envio.id}
                    onChange={handleChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                  />
                  <label
                    htmlFor={`envio-${envio.id}`}
                    className="flex flex-1 justify-between text-sm font-medium text-secondary"
                  >
                    <span>{envio.nombre}</span>
                    <span className="text-primary font-semibold">
                      {envio.precio == 0
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
          {restaurante?.metodos_pago.length > 0 ? (
            restaurante.metodos_pago
              .filter((metodoPago) => metodoPago.activo)
              .map((metodoPago) => (
                <div
                  key={metodoPago.id}
                  className="flex items-center space-x-4"
                >
                  <input
                    type="radio"
                    id={metodoPago.id}
                    name="metodoPago"
                    value={metodoPago.id}
                    checked={formData.metodoPago === metodoPago.id}
                    onChange={handleChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                  />
                  <label
                    htmlFor={metodoPago.id}
                    className="text-sm font-medium text-secondary"
                  >
                    {metodoPago.tipo}
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
                {restaurante.envios.find(
                  (envio) => envio.id === parseInt(formData.metodoEnvio)
                )?.precio == 0
                  ? "Gratis"
                  : parseInt(
                      restaurante.envios.find(
                        (envio) => envio.id === parseInt(formData.metodoEnvio)
                      )?.precio
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
