// app/dashboard/restaurantes/[slug]/envios/[envioId]/page.js (CORREGIDO)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  getDeliveryDetail,
  updateDelivery,
  deleteDelivery,
} from "@/app/services/apiService";

// Define un estado inicial CORREGIDO para el formulario
const initialFormData = {
  nombre: "",
  // <<-- ¡Campo 'precio' en lugar de 'costo'! -->>
  precio: "", // Usaremos string
  tiempo_estimado: "",
  // <<-- ¡Campo 'estado' en lugar de 'activo'! -->>
  estado: "", // Se llenará con el valor del backend ('activo', 'inactivo')
  // <<-- Eliminados 'orden' y 'descripcion' -->>
};

// Opciones de estado (las mismas que en la página de creación)
const deliveryStates = [
  { value: "", label: "-- Seleccionar Estado --" }, // Opción por defecto
  { value: "activo", label: "Activo" },
  { value: "inactivo", label: "Inactivo" },
  // Añade otros estados si tu modelo los tiene
];

export default function DeliveryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restauranteSlug = params.slug;
  const envioId = params.envioId;

  const [delivery, setDelivery] = useState(null);
  const [loadingDelivery, setLoadingDelivery] = useState(true);
  const [deliveryError, setDeliveryError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);

  console.log(
    `[DeliveryDetailPage] Renderizado para slug = ${restauranteSlug}, envioId = ${envioId}`
  );

  // --- Efecto: Cargar detalles al montar ---
  useEffect(() => {
    console.log("[DeliveryDetailPage] Efecto de carga de detalles disparado.");

    if (!restauranteSlug || !envioId) {
      console.warn("[DeliveryDetailPage] Faltan parámetros en la URL.");
      setDeliveryError("Información incompleta en la URL.");
      setLoadingDelivery(false);
      return;
    }

    const fetchDelivery = async () => {
      console.log(
        `[DeliveryDetailPage] Iniciando obtención de detalles para envío ${envioId}...`
      );
      try {
        setLoadingDelivery(true);
        setDeliveryError(null);
        setDelivery(null);

        const deliveryData = await getDeliveryDetail(restauranteSlug, envioId);

        if (deliveryData) {
          setDelivery(deliveryData);
          console.log(
            "[DeliveryDetailPage] Detalles del envío obtenidos:",
            deliveryData
          );

          // **<<-- Inicializar formData con los datos CORREGIDOS -->>**
          setFormData({
            nombre: deliveryData.nombre || "",
            precio:
              deliveryData.precio != null ? String(deliveryData.precio) : "", // <<-- Usar precio
            tiempo_estimado: deliveryData.tiempo_estimado || "",
            estado: deliveryData.estado || "", // <<-- Usar estado
            // <<-- Eliminar inicialización de orden y descripcion -->>
            // orden: deliveryData.orden != null ? deliveryData.orden : 0, // Eliminar
            // descripcion: deliveryData.descripcion || "", // Eliminar
          });
          console.log(
            "[DeliveryDetailPage] Estado del formulario inicializado."
          );
        } else {
          setDelivery(null);
          console.log(
            `[DeliveryDetailPage] Obtención de detalles para envío ${envioId} retornó vacío o nulo.`
          );
          setDeliveryError(
            `No se encontraron detalles para la opción de envío con ID ${envioId}.`
          );
        }
      } catch (err) {
        console.error(
          `[DeliveryDetailPage] Error al obtener detalles del envío ${envioId}:`,
          err
        );
        setDeliveryError(
          `Error al cargar los detalles de la opción de envío ${envioId}.`
        );
      } finally {
        setLoadingDelivery(false);
        console.log(
          "[DeliveryDetailPage] Finalizada obtención de detalles del envío."
        );
      }
    };

    fetchDelivery();
  }, [restauranteSlug, envioId]); // Dependencias

  // --- Manejo de cambios en el formulario ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === "checkbox" ? checked : value; // Mantener si tienes otros checkboxes
    setFormData({ ...formData, [name]: finalValue });
    console.log(
      `[handleInputChange] Field ${name} changed. Value: ${finalValue}`
    );
  };

  // --- Manejo de envío (ACTUALIZAR) ---
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();

    console.log(
      "[DeliveryDetailPage] Formulario de edición enviado. Datos:",
      formData
    );

    // Validaciones básicas
    if (!formData.nombre || formData.precio === "") {
      setUpdateError(
        "Por favor, completa los campos obligatorios (Nombre, Precio)."
      );
      setUpdateSuccess(null);
      return;
    }
    if (isNaN(parseFloat(formData.precio))) {
      setUpdateError("El precio debe ser un número válido.");
      setUpdateSuccess(null);
      return;
    }

    try {
      setUpdating(true);
      setUpdateError(null);
      setUpdateSuccess(null);

      // Preparar datos para enviar (PATCH)
      const dataToSubmit = {
        ...formData,
        precio: parseFloat(formData.precio), // <<-- Usar precio, convertir a número
        // <<-- Usar estado en lugar de activo -->>
        estado: formData.estado, // Enviar el valor string
        // <<-- Eliminar 'orden' y 'descripcion' de dataToSubmit -->>
        // orden: parseInt(formData.orden, 10), // Eliminar si no existe
        // descripcion: formData.descripcion || "", // Eliminar si no existe

        // Si tuvieras un campo 'activo' aún, asegúrate que se envíe:
        // activo: formData.activo, // Esto ya no aplica si usas 'estado'
      };

      console.log(
        "[handleUpdateSubmit] Data being prepared for API:",
        dataToSubmit
      );

      // Llama a la API para actualizar
      const updatedDeliveryData = await updateDelivery(
        restauranteSlug,
        envioId,
        dataToSubmit
      );

      console.log(
        "[DeliveryDetailPage] updateDelivery retornó:",
        updatedDeliveryData
      );

      // Si la actualización fue exitosa
      setUpdateSuccess("Opción de envío actualizada exitosamente.");
      setDelivery(updatedDeliveryData); // Actualiza los datos mostrados
      setIsEditing(false); // Sale del modo edición

      setUpdateError(null); // Limpia errores
    } catch (err) {
      console.error(
        "[DeliveryDetailPage] Error al actualizar opción de envío:",
        err
      );
      const errorMessage =
        err.body?.detail ||
        err.body?.non_field_errors?.[0] ||
        err.message ||
        "Error desconocido al actualizar opción de envío.";
      const fieldErrors = err.body || null;

      if (fieldErrors && typeof fieldErrors === "object") {
        const firstFieldErrorKey = Object.keys(fieldErrors)[0];
        const firstFieldErrorMsg = Array.isArray(
          fieldErrors[firstFieldErrorKey]
        )
          ? fieldErrors[firstFieldErrorKey][0]
          : fieldErrors[firstFieldErrorKey];
        setUpdateError(
          `Error de validación: ${firstFieldErrorKey}: ${firstFieldErrorMsg}`
        );
      } else {
        setUpdateError(errorMessage);
      }
      setUpdateSuccess(null);
    } finally {
      setUpdating(false);
      console.log("[DeliveryDetailPage] Finalizado intento de actualización.");
    }
  };

  // --- Manejo de botón ELIMINAR ---
  const handleDelete = async () => {
    console.log(
      `[DeliveryDetailPage] Intentando eliminar opción de envío ${envioId}...`
    );

    // Confirmación (usando el nombre del envío)
    const confirmDelete = confirm(
      `¿Estás seguro de que deseas eliminar la opción de envío "${
        delivery?.nombre || "este envío"
      }"?`
    );
    if (!confirmDelete) {
      console.log("[DeliveryDetailPage] Eliminación cancelada por el usuario.");
      return;
    }

    try {
      setDeleting(true);
      setDeleteError(null);

      // Llama a la API para eliminar
      await deleteDelivery(restauranteSlug, envioId);

      console.log(
        `[DeliveryDetailPage] Opción de envío ${envioId} eliminada exitosamente.`
      );

      // Redirige a la lista
      router.push(`/dashboard/restaurantes/${restauranteSlug}/envios`);
    } catch (err) {
      console.error(
        `[DeliveryDetailPage] Error al eliminar opción de envío ${envioId}:`,
        err
      );
      const errorMessage =
        err.body?.detail ||
        err.message ||
        "Error desconocido al eliminar opción de envío.";
      setDeleteError(`Error al eliminar la opción de envío: ${errorMessage}`);
    } finally {
      setDeleting(false);
      console.log("[DeliveryDetailPage] Finalizado intento de eliminación.");
    }
  };

  // --- Lógica de Renderizado ---

  // Mostrar carga inicial
  if (loadingDelivery) {
    console.log("[DeliveryDetailPage] Renderizando Carga Inicial...");
    return (
      /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando opción de envío...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si falló la carga inicial
  if (deliveryError && !delivery) {
    console.log("[DeliveryDetailPage] Renderizando Pantalla de Error...");
    return (
      /* ... (Código de pantalla de error) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-2">
            Error al cargar la opción de envío:
          </p>
          <p>{deliveryError}</p>
          <Link
            href={`/dashboard/restaurantes/${restauranteSlug}/envios`}
            className="mt-4 inline-block text-blue-600 hover:underline"
          >
            Volver a la lista
          </Link>
        </div>
      </div>
    );
  }

  // Si llegamos aquí, la opción de envío cargó.
  console.log(
    `[DeliveryDetailPage] Renderizando ${
      isEditing ? "Formulario de Edición" : "Vista de Detalle"
    }.`
  );

  // Si delivery es null en este punto, es un estado inesperado si no hubo error.
  if (!delivery) {
    console.warn(
      "[DeliveryDetailPage] Estado inesperado: delivery es null pero no hubo error de carga inicial."
    );
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
        <div className="bg-gray-100 text-gray-700 p-6 rounded-lg shadow-md">
          <p>
            No se pudieron mostrar los detalles. Intenta recargar la página.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
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
        {isEditing ? "Editar Opción de Envío:" : "Detalle de Opción de Envío:"}{" "}
        {delivery.nombre || "Sin Nombre"}
      </h1>
      {/* Sección de Botón Eliminar */}
      {/* Muestra el botón eliminar solo en modo viendo */}
      {!isEditing && (
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">
            Eliminar Opción de Envío
          </h2>
          {deleteError && (
            <div className="bg-red-100 text-red-700 p-3 rounded-md mr-4">
              {deleteError}
            </div>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting || updating || loadingDelivery}
            className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {deleting ? "Eliminando..." : "Eliminar Opción de Envío"}
          </button>
        </div>
      )}
      {/* ** <<-- Renderiza VISTA DE DETALLE o FORMULARIO DE EDICIÓN condicionalmente -->> ** */}
      {!isEditing ? ( // --- Si NO estamos editando, muestra la vista de detalle ---
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles</h2>

          {/* Botón Editar para cambiar al modo edición */}
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing(true)}
              disabled={updating || deleting || loadingDelivery}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Editar Opción de Envío
            </button>
          </div>

          {/* Mostrar los detalles */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
            <p>
              <span className="font-semibold text-gray-700">Nombre:</span>{" "}
              {delivery.nombre || "N/A"}
            </p>
            {/* Estado */}
            <p>
              <span className="font-semibold text-gray-700">Estado:</span>{" "}
              <span className="capitalize">
                {delivery.estado?.replace("_", " ") || "N/A"}
              </span>
            </p>{" "}
            {/* Muestra estado, capitaliza */}
            {/* Precio */}
            <p>
              <span className="font-semibold text-gray-700">Precio:</span>{" "}
              {delivery.precio != null
                ? parseFloat(delivery.precio).toLocaleString("es-CL", {
                    style: "currency",
                    currency: "CLP",
                  })
                : "N/A"}
            </p>{" "}
            {/* Muestra precio */}
            {/* Fechas */}
            <p>
              <span className="font-semibold text-gray-700">Creado:</span>{" "}
              {delivery.created_at
                ? new Date(delivery.created_at).toLocaleString()
                : "N/A"}
            </p>
            <p>
              <span className="font-semibold text-gray-700">Actualizado:</span>{" "}
              {delivery.updated_at
                ? new Date(delivery.updated_at).toLocaleString()
                : "N/A"}
            </p>
          </div>
        </div>
      ) : (
        // --- Si SÍ estamos editando, muestra el formulario ---

        <form
          onSubmit={handleUpdateSubmit}
          className="bg-white p-6 rounded-lg shadow-md border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-4">
            Formulario de Edición
          </h2>

          {/* Botones de Guardar y Cancelar */}
          <div className="flex justify-end gap-4 mb-4">
            {updateSuccess && (
              /* ... */ <div className="bg-green-100 text-green-700 p-2 rounded-md text-sm flex items-center">
                {updateSuccess}
              </div>
            )}
            {updateError && (
              /* ... */ <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm flex items-center">
                {updateError}
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                // Opcional: Resetear formData a los datos originales
                if (delivery) {
                  setFormData({
                    nombre: delivery.nombre || "",
                    precio:
                      delivery.precio != null ? String(delivery.precio) : "", // Usar precio
                    tiempo_estimado: delivery.tiempo_estimado || "",
                    estado: delivery.estado || "", // Usar estado
                    // Eliminar reseteo de orden y descripcion
                    // orden: delivery.orden != null ? delivery.orden : 0,
                    // descripcion: delivery.descripcion || "",
                  });
                }
                setUpdateError(null);
                setUpdateSuccess(null);
              }}
              disabled={updating}
              className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={updating || deleting}
              className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updating ? "Guardando Cambios..." : "Guardar Cambios"}
            </button>
          </div>

          {/* --- Campos del Formulario (adaptados) --- */}
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
              name="nombre"
              value={formData.nombre}
              onChange={handleInputChange}
              required
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>
          {/* Campo: Precio (antes Costo) */}
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
              name="precio"
              value={formData.precio}
              onChange={handleInputChange}
              required
              step="0.01"
              min="0"
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
            />
          </div>

          {/* Campo: Estado (Selector) */}
          <div className="mb-6">
            {" "}
            {/* Más margen abajo */}
            <label
              htmlFor="estado"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Estado
            </label>
            <select
              id="estado"
              name="estado" // <<-- Name debe coincidir
              value={formData.estado}
              onChange={handleInputChange}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
            >
              {deliveryStates.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* <<-- Eliminados campos Orden y Descripción del formulario -->> */}

          {/* Botón de Envío (se movió arriba) */}
        </form>
      )}{" "}
      {/* --- Fin de la renderización condicional --- */}
    </div>
  );
}
