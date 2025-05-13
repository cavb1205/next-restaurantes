// app/dashboard/restaurantes/[slug]/envios/crear/page.js
"use client"; // Client Component

import { useState } from "react"; // Hook useState
import { useParams, useRouter } from "next/navigation"; // Hooks para URL y navegación
import Link from "next/link"; // Para enlaces
// Importa la función para crear envío
import { createDelivery } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

// Define un estado inicial para el formulario con los campos del modelo Envio
// Usa los nombres de campo exactos que tu Serializador de Envio espera en la entrada POST
const initialFormData = {
  nombre: "",
  descripcion: "",
  precio: "", // Usaremos string para la entrada, convertir a número si es necesario al enviar
  activo: true, // Checkbox por defecto activo
  // No incluyas 'id', 'restaurante', 'created_at', 'updated_at'
};

export default function CreateDeliveryPage() {
  const params = useParams();
  const router = useRouter(); // Hook para redirigir
  const restauranteSlug = params.slug; // Slug del restaurante

  // Estado para los datos del formulario
  const [formData, setFormData] = useState(initialFormData);
  // Estado para carga/error al ENVIAR el formulario
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Estado para mensajes de éxito
  const [successMessage, setSuccessMessage] = useState(null);

  console.log(
    `[CreateDeliveryPage] Renderizado para slug = ${restauranteSlug}`
  );

  // --- Manejo de cambios en los campos del formulario ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    const finalValue = type === "checkbox" ? checked : value;
    setFormData({ ...formData, [name]: finalValue });
    console.log(
      `[handleInputChange] Field ${name} changed. Value: ${finalValue}`
    );
  };

  // --- Manejo del envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene la recarga

    console.log("[CreateDeliveryPage] Formulario enviado. Datos:", formData);

    // Validaciones básicas del lado del cliente
    if (!formData.nombre || formData.precio === "") {
      // precio 0 es válido, pero "" no
      setSubmitError(
        "Por favor, completa los campos obligatorios (Nombre, precio)."
      );
      return;
    }
    if (isNaN(parseFloat(formData.precio))) {
      setSubmitError("El precio debe ser un número válido.");
      return;
    }

    try {
      setSubmitting(true); // Activa el estado de envío
      setSubmitError(null); // Limpia errores previos
      setSuccessMessage(null); // Limpia mensaje de éxito previo

      // --- Preparar los datos para enviar a la API ---
      // Enviamos JSON directamente (authenticatedRequest lo serializará)
      const dataToSubmit = {
        ...formData,
        // Asegura que el precio sea un número (float) o string con punto decimal si tu backend lo espera
        precio: parseFloat(formData.precio), // Convierte a número flotante
        // Asegura que el orden sea un número entero
        orden: parseInt(formData.orden, 10), // Convierte a entero base 10
        // Asegura que los booleanos se envíen como booleanos
        activo: formData.activo,
      };

      console.log("[handleSubmit] Data being prepared for API:", dataToSubmit);

      // ** Llama a la función de la API para crear la opción de envío **
      // createDelivery se encargará de usar authenticatedRequest con POST
      const newDelivery = await createDelivery(restauranteSlug, dataToSubmit); // Pasa el slug y los datos preparados

      console.log("[CreateDeliveryPage] createDelivery retornó:", newDelivery);

      // Si la creación fue exitosa:
      setSuccessMessage("Opción de envío creada exitosamente.");
      setFormData(initialFormData); // Limpia el formulario (opcional)

      // Redirige a la página de lista después de un pequeño retraso
      setTimeout(() => {
        router.push(`/dashboard/restaurantes/${restauranteSlug}/envios`); // Redirige a la lista de envíos
      }, 1500); // Redirige después de 1.5 segundos
    } catch (err) {
      console.error(
        "[CreateDeliveryPage] Error al crear opción de envío:",
        err
      );
      // Manejar errores.
      const errorMessage =
        err.body?.detail ||
        err.body?.non_field_errors?.[0] ||
        err.message ||
        "Error desconocido al crear opción de envío.";
      const fieldErrors = err.body || null; // Guarda los errores por campo

      if (fieldErrors && typeof fieldErrors === "object") {
        console.error(
          "[CreateDeliveryPage] Errores de validación del backend:",
          fieldErrors
        );
        const firstFieldErrorKey = Object.keys(fieldErrors)[0];
        const firstFieldErrorMsg = Array.isArray(
          fieldErrors[firstFieldErrorKey]
        )
          ? fieldErrors[firstFieldErrorKey][0]
          : fieldErrors[firstFieldErrorKey];
        setSubmitError(
          `Error de validación: ${firstFieldErrorKey}: ${firstFieldErrorMsg}`
        );
      } else {
        setSubmitError(errorMessage);
      }
      setSuccessMessage(null);
    } finally {
      setSubmitting(false); // Desactiva el estado de envío
      console.log("[CreateDeliveryPage] Finalizado intento de creación.");
    }
  };

  // --- Lógica de Renderizado ---
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">
      {" "}
      {/* Contenedor principal */}
      {/* Botón para volver a la lista */}
      <Link
        href={`/dashboard/restaurantes/${restauranteSlug}/envios`}
        className="text-blue-600 hover:underline mb-6 inline-block text-lg"
      >
        ← Volver a Opciones de Envío
      </Link>
      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
        Añadir Nueva Opción de Envío
      </h1>
      {/* Formulario de Creación */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
      >
        {/* Mensaje de éxito */}
        {successMessage && (
          <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
            {successMessage}
          </div>
        )}

        {/* Mensaje de error */}
        {submitError && (
          <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
            {submitError}
          </div>
        )}

        {/* Campo: Nombre */}
        <div className="mb-4">
          <label
            htmlFor="nombre"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="nombre"
            name="nombre" // <<-- Name debe coincidir con el campo del Serializador
            value={formData.nombre}
            onChange={handleInputChange}
            required
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        {/* Campo: Descripción */}
        <div className="mb-4">
          <label
            htmlFor="descripcion"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descripción
          </label>
          <textarea
            id="descripcion"
            name="descripcion" // <<-- Name debe coincidir con el campo del Serializador
            value={formData.descripcion}
            onChange={handleInputChange}
            rows="3"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
          ></textarea>
        </div>

        {/* Campo: precio */}
        <div className="mb-4">
          <label
            htmlFor="precio"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Precio <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="precio"
            name="precio" // <<-- Name debe coincidir con el campo del Serializador
            value={formData.precio}
            onChange={handleInputChange}
            required
            step="0.01" // Permite decimales
            min="0"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
          />
        </div>

        {/* Campo: Activo (Checkbox) */}
        <div className="mb-6">
          {" "}
          {/* Más margen abajo */}
          <label className="inline-flex items-center">
            <input
              type="checkbox"
              className="form-checkbox text-primary focus:ring-primary rounded"
              name="activo" // <<-- Name debe coincidir con el campo del Serializador
              checked={formData.activo}
              onChange={handleInputChange}
            />
            <span className="ml-2 text-sm font-medium text-gray-700">
              Activo (Visible para los clientes)
            </span>
          </label>
        </div>

        {/* Botón de Envío del Formulario */}
        <button
          type="submit"
          disabled={submitting} // Deshabilitado si se está enviando
          className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "Guardando..." : "Crear Opción de Envío"}
        </button>
      </form>
    </div>
  );
}
