"use client";

import { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { getNegocio,getNegocioEnvios } from "@/app/services/negocio";

export default function CheckoutForm({ onSubmit }) {
  const { cart, getCartTotal } = useCart();
  const negocio = cart[0]?.negocio;
  const [envios, setEnvios] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchEnvios = async () => {
      if (negocio?.slug) {
        try {
          const response = await getNegocioEnvios(negocio.id);

          // Ajustar según la estructura real de la respuesta
          const negocioData = response.data ? response.data[0] : response[0];
            console.log(negocioData)
          if (negocioData?.attributes?.envios) {
            setEnvios(negocioData.attributes.envios);
          } else if (negocioData?.envios) {
            // Si la estructura es diferente
            setEnvios(negocioData.envios);
          } else {
            setEnvios([]);
          }
        } catch (error) {
          console.error("Error al obtener los envíos:", error);
          setEnvios([]);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchEnvios();
  }, [negocio]);

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

  const handleSubmit = (e) => {
    e.preventDefault();

    let costoEnvio = 0;
    if (formData.metodoEnvio && envios) {
      const envioSeleccionado = envios.find(
        (envio) => envio.id === parseInt(formData.metodoEnvio)
      );
      costoEnvio = envioSeleccionado?.precio || 0;
    }

    onSubmit({
      ...formData,
      cart,
      negocio,
      costoEnvio,
      total: getCartTotal() + costoEnvio,
    });
  };

  // Calcular el total incluyendo el envío
  const totalConEnvio = () => {
    if (!formData.metodoEnvio || !envios) return getCartTotal();

    const envioSeleccionado = envios.find(
      (envio) => envio.id === parseInt(formData.metodoEnvio)
    );
    return getCartTotal() + (envioSeleccionado?.precio || 0);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Información del Negocio */}
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
        <h2 className="text-xl font-semibold text-primary mb-4">
          Información del Pedido
        </h2>
        <div className="space-y-2">
          <p className="text-gray-700">
            <span className="font-medium">Restaurante:</span>{" "}
            {negocio?.nombre || "No disponible"}
          </p>
          <p className="text-gray-700">
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
            <p className="text-gray-500 text-center py-2">
              Cargando métodos de envío...
            </p>
          ) : envios && envios.length > 0 ? (
            envios
              .filter((envio) => envio.estado)
              .map((envio) => (
                <div key={envio.id} className="flex items-center space-x-4">
                  <input
                    type="radio"
                    id={`envio-${envio.id}`}
                    name="metodoEnvio"
                    value={envio.id}
                    required
                    checked={formData.metodoEnvio === envio.id.toString()}
                    onChange={handleChange}
                    className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
                  />
                  <label
                    htmlFor={`envio-${envio.id}`}
                    className="flex flex-1 justify-between text-sm font-medium text-gray-700"
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
            <p className="text-gray-500 text-center py-2">
              No hay métodos de envío disponibles
            </p>
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
              className="block text-sm font-medium text-gray-700"
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
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
            />
          </div>

          <div>
            <label
              htmlFor="referencia"
              className="block text-sm font-medium text-gray-700"
            >
              Referencia (opcional)
            </label>
            <input
              type="text"
              id="referencia"
              name="referencia"
              value={formData.referencia}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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
          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="efectivo"
              name="metodoPago"
              value="efectivo"
              checked={formData.metodoPago === "efectivo"}
              onChange={handleChange}
              className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
            />
            <label
              htmlFor="efectivo"
              className="text-sm font-medium text-gray-700"
            >
              Efectivo
            </label>
          </div>

          <div className="flex items-center space-x-4">
            <input
              type="radio"
              id="transferencia"
              name="metodoPago"
              value="transferencia"
              checked={formData.metodoPago === "transferencia"}
              onChange={handleChange}
              className="focus:ring-primary h-4 w-4 text-primary border-gray-300"
            />
            <label
              htmlFor="transferencia"
              className="text-sm font-medium text-gray-700"
            >
              Transferencia bancaria
            </label>
          </div>
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
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
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

      {/* Botón de Enviar */}
      <button
        type="submit"
        className="w-full bg-primary text-white py-3 px-4 rounded-lg font-medium hover:bg-primary/90 transition-colors duration-200"
      >
        Confirmar Pedido
      </button>
    </form>
  );
}
