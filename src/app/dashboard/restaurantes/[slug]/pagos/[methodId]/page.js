// app/dashboard/restaurantes/[slug]/pagos/[methodId]/page.js
"use client"; // Client Component

import { useState, useEffect } from "react"; // Hooks
import { useParams, useRouter } from "next/navigation"; // Hooks para URL y navegación
import Link from "next/link"; // Para enlaces
// Importa las funciones de API para métodos de pago
import { getPaymentMethodDetail, updatePaymentMethod, deletePaymentMethod } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

// Define un estado inicial para el formulario (se llenará con los datos del método de pago)
// Usa los nombres de campo exactos que tu Serializador de MetodoPago espera para ACTUALIZACIÓN
const initialFormData = {
  tipo: "",
  descripcion: "",
  orden: 0,
  activo: true,
  configuracion: "", // Campo para JSON u otra configuración (lo trataremos como texto por ahora)
  // No incluyas 'id', 'restaurante', 'created_at', 'updated_at' aquí para enviar en el PATCH/PUT
};

// Opciones de tipo de método de pago (ajústalas a tus Choices del modelo Django)
const paymentMethodTypes = [
    { value: '', label: '-- Seleccionar Tipo --' },
    { value: 'efectivo', label: 'Efectivo' },
    { value: 'transferencia', label: 'Transferencia Bancaria' },
    { value: 'tarjeta', label: 'Pago con Tarjeta' },
    { value: 'online', label: 'Pago Online (WebPay, PayPal, etc.)' },
    // Añade o modifica según tus tipos
];


export default function PaymentMethodDetailPage() {
  const params = useParams();
  const router = useRouter(); // Hook para redirigir
  const restauranteSlug = params.slug; // Slug del restaurante
  // **<<-- Obtiene el ID del método de pago de la URL -->>**
  const methodId = params.methodId; // ID del método de pago

  // Estado para los datos del método de pago (los que se cargan inicialmente)
  const [paymentMethod, setPaymentMethod] = useState(null);
  // Estado para la carga inicial del método de pago
  const [loadingMethod, setLoadingMethod] = useState(true);
  const [methodError, setMethodError] = useState(null);

  // **<<-- Estado para controlar si estamos en modo edición -->>**
  const [isEditing, setIsEditing] = useState(false); // Inicia en modo "viendo"

  // Estado para los datos del formulario de edición (inicializados desde el método de pago cargado)
  const [formData, setFormData] = useState(initialFormData);

  // Estado para la acción de ACTUALIZAR el método de pago (envío del formulario)
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null); // Mensaje de éxito de actualización

  // Estado para la acción de ELIMINAR el método de pago
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);


  console.log(`[PaymentMethodDetailPage] Renderizado para slug = ${restauranteSlug}, methodId = ${methodId}`);


  // --- Efecto 1: Cargar los detalles del método de pago al montar ---
  useEffect(() => {
      console.log("[PaymentMethodDetailPage] Efecto de carga de detalles disparado.");

      if (!restauranteSlug || !methodId) {
          console.warn("[PaymentMethodDetailPage] Faltan parámetros en la URL.");
          setMethodError("Información del método de pago incompleta en la URL.");
          setLoadingMethod(false);
          return;
      }

      // Función asíncrona para obtener detalles del método de pago
      const fetchPaymentMethod = async () => {
          console.log(`[PaymentMethodDetailPage] Iniciando obtención de detalles para método ${methodId}...`);
          try {
              setLoadingMethod(true); // Activa carga
              setMethodError(null); // Limpia errores previos
              setPaymentMethod(null); // Limpia datos previos

              // **<<-- Llama a la nueva función de la API para detalle -->>**
              const methodData = await getPaymentMethodDetail(restauranteSlug, methodId);

              if (methodData) {
                  setPaymentMethod(methodData); // Guarda los datos
                  console.log("[PaymentMethodDetailPage] Detalles del método de pago obtenidos:", methodData);

                  // **<<-- Inicializar el estado del formulario con los datos -->>**
                  setFormData({
                       tipo: methodData.tipo || "",
                       descripcion: methodData.descripcion || "",
                       orden: methodData.orden != null ? methodData.orden : 0,
                       activo: methodData.activo ?? true,
                       configuracion: methodData.configuracion ? JSON.stringify(methodData.configuracion, null, 2) : "", // Convierte JSON a string formateado
                  });
                   console.log("[PaymentMethodDetailPage] Estado del formulario inicializado.");

              } else {
                   setPaymentMethod(null);
                    console.log(`[PaymentMethodDetailPage] Obtención de detalles para método ${methodId} retornó vacío o nulo.`);
                    setMethodError(`No se encontraron detalles para el método de pago con ID ${methodId}.`);
               }

          } catch (err) {
              console.error(`[PaymentMethodDetailPage] Error al obtener detalles del método de pago ${methodId}:`, err);
              setMethodError(`Error al cargar los detalles del método de pago ${methodId}.`);
          } finally {
              setLoadingMethod(false); // Desactiva carga
               console.log("[PaymentMethodDetailPage] Finalizada obtención de detalles del método de pago.");
          }
      };

       fetchPaymentMethod(); // Dispara la obtención de detalles

    // Dependencias: methodId y restauranteSlug
  }, [restauranteSlug, methodId]); // Añade getPaymentMethodDetail si eslint lo pide


   // --- Manejo de cambios en los campos del formulario de edición ---
   const handleInputChange = (e) => {
     const { name, value, type, checked } = e.target;

     // No hay inputs tipo 'file' comunes para MetodoPago
     const finalValue = type === 'checkbox' ? checked : value;
     setFormData({ ...formData, [name]: finalValue });
     console.log(`[handleInputChange] Field ${name} changed. Value: ${finalValue}`);
   };


  // --- Manejo del envío del formulario de edición (ACTUALIZAR) ---
  const handleUpdateSubmit = async (e) => {
      e.preventDefault();

      console.log("[PaymentMethodDetailPage] Formulario de edición enviado. Datos:", formData);

       // Validaciones básicas (cliente)
      if (!formData.tipo || !formData.descripcion) {
          setUpdateError("Por favor, completa los campos obligatorios (Tipo, Descripción).");
          setUpdateSuccess(null);
          return;
      }
       // Validación para campo 'configuracion' si esperas JSON
       let configuracionData = {};
       if (formData.configuracion) {
           try {
               configuracionData = JSON.parse(formData.configuracion); // Intenta parsear como JSON
           } catch (jsonError) {
                setUpdateError("El campo 'Configuración' debe contener JSON válido.");
                console.error("Error parsing configuracion JSON:", jsonError);
                setUpdateSuccess(null);
                return;
           }
       }


      try {
        setUpdating(true); // Activa estado de actualización
        setUpdateError(null); // Limpia errores previos
         setUpdateSuccess(null); // Limpia éxito previo

        // --- Preparar los datos para enviar a la API (PATCH) ---
        // Enviamos JSON directamente (authenticatedRequest lo serializará)
        const dataToSubmit = {
            ...formData,
            configuracion: configuracionData, // Usa el objeto JSON parseado
            orden: parseInt(formData.orden, 10), // Convierte a entero
            // Asegúrate que los booleanos se envíen como booleanos (JSON.stringify sí)
             activo: formData.activo,
        };

       console.log("[handleUpdateSubmit] Data being prepared for API:", dataToSubmit);


        // ** Llama a la función de la API para actualizar **
        // updatePaymentMethod usará authenticatedRequest con PATCH
        const updatedMethodData = await updatePaymentMethod(restauranteSlug, methodId, dataToSubmit); // Pasa slug, ID y datos

        console.log("[PaymentMethodDetailPage] updatePaymentMethod retornó:", updatedMethodData);

        // Si la actualización fue exitosa:
        setUpdateSuccess("Método de pago actualizado exitosamente.");
        setPaymentMethod(updatedMethodData); // Actualiza los datos mostrados con la respuesta del API
        // **<<-- Vuelve al modo "viendo" después de actualizar -->>**
        setIsEditing(false); // Sale del modo edición

         setUpdateError(null); // Limpia errores de validación anteriores


      } catch (err) {
        console.error("[PaymentMethodDetailPage] Error al actualizar método de pago:", err);
        // Manejar errores
        const errorMessage = err.body?.detail || err.body?.non_field_errors?.[0] || err.message || "Error desconocido al actualizar método de pago.";
        const fieldErrors = err.body || null;

        if (fieldErrors && typeof fieldErrors === 'object') {
             const firstFieldErrorKey = Object.keys(fieldErrors)[0];
             const firstFieldErrorMsg = Array.isArray(fieldErrors[firstFieldErrorKey]) ? fieldErrors[firstFieldErrorKey][0] : fieldErrors[firstFieldErrorKey];
              setUpdateError(`Error de validación: ${firstFieldErrorKey}: ${firstFieldErrorMsg}`);

         } else {
              setUpdateError(errorMessage);
         }
         setUpdateSuccess(null);

      } finally {
        setUpdating(false);
        console.log("[PaymentMethodDetailPage] Finalizado intento de actualización.");
      }
  };


    // --- Manejo del botón ELIMINAR ---
    const handleDelete = async () => {
        console.log(`[PaymentMethodDetailPage] Intentando eliminar método de pago ${methodId}...`);

        // Confirmación
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el método de pago "${paymentMethod?.descripcion || 'este método'}"?`);
        if (!confirmDelete) {
            console.log("[PaymentMethodDetailPage] Eliminación cancelada por el usuario.");
            return;
        }

        try {
            setDeleting(true); // Activa estado de eliminación
            setDeleteError(null); // Limpia errores previos

            // ** Llama a la función de la API para eliminar **
            // deletePaymentMethod usará authenticatedRequest con DELETE
            await deletePaymentMethod(restauranteSlug, methodId); // Pasa slug e ID

            console.log(`[PaymentMethodDetailPage] Método de pago ${methodId} eliminado exitosamente.`);

            // Si la eliminación fue exitosa: Redirige a la página de lista
            router.push(`/dashboard/restaurantes/${restauranteSlug}/pagos`);

        } catch (err) {
             console.error(`[PaymentMethodDetailPage] Error al eliminar método de pago ${methodId}:`, err);
             const errorMessage = err.body?.detail || err.message || "Error desconocido al eliminar método de pago.";
             setDeleteError(`Error al eliminar el método de pago: ${errorMessage}`);
        } finally {
             setDeleting(false);
             console.log("[PaymentMethodDetailPage] Finalizado intento de eliminación.");
        }
    };


  // --- Lógica de Renderizado ---

  // Mostrar carga inicial
  if (loadingMethod) {
     console.log("[PaymentMethodDetailPage] Renderizando Carga Inicial...");
    return ( /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando método de pago...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si falló la carga inicial
  if (methodError && !paymentMethod) {
     console.log("[PaymentMethodDetailPage] Renderizando Pantalla de Error...");
    return ( /* ... (Código de pantalla de error) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
         <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
             <p className="font-semibold text-lg mb-2">Error al cargar el método de pago:</p>
             <p>{methodError}</p>
              <Link href={`/dashboard/restaurantes/${restauranteSlug}/pagos`} className="mt-4 inline-block text-blue-600 hover:underline">Volver a la lista</Link>
         </div>
      </div>
    );
  }

  // Si llegamos aquí, el método de pago cargó (o no cargó y el error ya se mostró).
  console.log(`[PaymentMethodDetailPage] Renderizando ${isEditing ? 'Formulario de Edición' : 'Vista de Detalle'}.`);

  // Si paymentMethod es null en este punto, es un estado inesperado si no hubo error.
  if (!paymentMethod) {
       console.warn("[PaymentMethodDetailPage] Estado inesperado: paymentMethod es null pero no hubo error de carga inicial.");
        return (
           <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="bg-gray-100 text-gray-700 p-6 rounded-lg shadow-md">
                    <p>No se pudieron mostrar los detalles del método de pago. Intenta recargar la página.</p>
               </div>
           </div>
       );
  }


  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl"> {/* Contenedor principal */}

        {/* Botón para volver a la lista */}
        <Link href={`/dashboard/restaurantes/${restauranteSlug}/pagos`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver a Métodos de Pago
        </Link>

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
         {isEditing ? 'Editar Método de Pago:' : 'Detalle del Método de Pago:'} {paymentMethod.tipo ? paymentMethod.tipo.replace('_', ' ') : 'Sin Tipo'}
      </h1>

      {/* Sección de Botón Eliminar */}
       {/* Muestra el botón eliminar solo en modo viendo */}
      {!isEditing && ( // Muestra solo en modo viendo
           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 flex justify-between items-center">
               <h2 className="text-xl font-semibold text-gray-800">Eliminar Método de Pago</h2>
                {/* Mensaje de error de eliminación */}
                {deleteError && (
                     <div className="bg-red-100 text-red-700 p-3 rounded-md mr-4">
                         {deleteError}
                     </div>
                 )}
                {/* Botón de eliminación */}
               <button
                   onClick={handleDelete} // Llama a la función handleDelete
                   disabled={deleting || updating || loadingMethod} // Deshabilita si ya eliminando o actualizando o cargando
                   className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   {deleting ? 'Eliminando...' : 'Eliminar Método de Pago'}
               </button>
            </div>
      )}


      {/* ** <<-- Renderiza VISTA DE DETALLE o FORMULARIO DE EDICIÓN condicionalmente -->> ** */}

      {!isEditing ? ( // --- Si NO estamos editando, muestra la vista de detalle ---
           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles</h2> {/* Título para la vista de detalle */}

                {/* Botón Editar para cambiar al modo edición */}
               <div className="flex justify-end mb-4">
                   <button
                       onClick={() => setIsEditing(true)} // Cambia a modo edición
                        disabled={updating || deleting || loadingMethod} // Deshabilitar si hay otra acción en curso
                       className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Editar Método de Pago
                   </button>
               </div>

               {/* Mostrar los detalles del método de pago */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid para detalles */}
                   {/* Tipo */}
                   <p><span className="font-semibold text-gray-700">Tipo:</span> {paymentMethod.tipo ? paymentMethod.tipo.replace('_', ' ') : 'N/A'}</p>
                    {/* Activo */}
                    <p><span className="font-semibold text-gray-700">Activo:</span> {paymentMethod.activo ? 'Sí' : 'No'}</p>
                     {/* Orden */}
                    <p><span className="font-semibold text-gray-700">Orden:</span> {paymentMethod.orden != null ? paymentMethod.orden : 'N/A'}</p>
                     {/* Descripción */}
                     {paymentMethod.descripcion && (
                         <div className="md:col-span-2"> {/* Ocupa 2 columnas */}
                              <p><span className="font-semibold text-gray-700">Descripción:</span> {paymentMethod.descripcion}</p>
                         </div>
                     )}
                     {/* Configuración (si existe y es JSON) */}
                    {paymentMethod.configuracion && (
                         <div className="md:col-span-2">
                             <p className="font-semibold text-gray-700 mb-1">Configuración (JSON):</p>
                             {/* Muestra el JSON formateado si es un objeto, o el valor directo si es string */}
                             <pre className="bg-gray-100 p-3 rounded-md text-sm overflow-auto">
                                 {typeof paymentMethod.configuracion === 'object'
                                     ? JSON.stringify(paymentMethod.configuracion, null, 2)
                                     : String(paymentMethod.configuracion) // En caso de ser string u otro tipo
                                 }
                             </pre>
                         </div>
                    )}
                     {/* Fechas */}
                     <p><span className="font-semibold text-gray-700">Creado:</span> {paymentMethod.created_at ? new Date(paymentMethod.created_at).toLocaleString() : 'N/A'}</p>
                     <p><span className="font-semibold text-gray-700">Actualizado:</span> {paymentMethod.updated_at ? new Date(paymentMethod.updated_at).toLocaleString() : 'N/A'}</p>
               </div>

           </div>

      ) : ( // --- Si SÍ estamos editando, muestra el formulario de edición ---

          <form onSubmit={handleUpdateSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Formulario de Edición</h2> {/* Título para el formulario */}

              {/* Botones de Guardar y Cancelar Edición */}
               <div className="flex justify-end gap-4 mb-4">
                    {/* Mensaje de éxito de actualización */}
                     {updateSuccess && (
                         <div className="bg-green-100 text-green-700 p-2 rounded-md text-sm flex items-center">
                             {updateSuccess}
                         </div>
                     )}
                    {/* Mensaje de error de actualización */}
                     {updateError && (
                         <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm flex items-center">
                             {updateError}
                         </div>
                     )}

                   <button
                       type="button" // Importante: type="button" para evitar que envíe el formulario
                       onClick={() => {
                            setIsEditing(false); // Vuelve al modo viendo
                            // Opcional: Resetear formData a los datos originales
                            if(paymentMethod) {
                                setFormData({
                                    tipo: paymentMethod.tipo || "",
                                    descripcion: paymentMethod.descripcion || "",
                                    orden: paymentMethod.orden != null ? paymentMethod.orden : 0,
                                    activo: paymentMethod.activo ?? true,
                                    configuracion: paymentMethod.configuracion ? JSON.stringify(paymentMethod.configuracion, null, 2) : "",
                                });
                            }
                            setUpdateError(null); // Limpia errores al cancelar
                            setUpdateSuccess(null); // Limpia éxito al cancelar
                       }}
                        disabled={updating} // Deshabilitar si está guardando
                       className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Cancelar
                   </button>
                  <button
                    type="submit" // type="submit" para enviar el formulario
                    disabled={updating || deleting} // Deshabilitado si actualizando o eliminando
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Guardando Cambios...' : 'Guardar Cambios'}
                  </button>
               </div>


             {/* --- Campos del Formulario (copiados de la página de creación) --- */}
              {/* Campo: Tipo (Selector) */}
              <div className="mb-4">
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo <span className="text-red-500">*</span></label>
                  <select
                      id="tipo"
                      name="tipo"
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                  >
                      {paymentMethodTypes.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                  </select>
              </div>

              {/* Campo: Descripción */}
              <div className="mb-4">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción <span className="text-red-500">*</span></label>
                  <textarea
                      id="descripcion"
                      name="descripcion"
                      value={formData.descripcion}
                      onChange={handleInputChange}
                      rows="3"
                      required
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
                  ></textarea>
              </div>

               {/* Campo: Orden */}
                <div className="mb-4">
                    <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                    <input
                        type="number"
                        id="orden"
                        name="orden"
                        value={formData.orden}
                        onChange={handleInputChange}
                        min="0"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
                    />
                </div>

               {/* Campo: Activo (Checkbox) */}
               <div className="mb-4">
                    <label className="inline-flex items-center">
                        <input
                            type="checkbox"
                            className="form-checkbox text-primary focus:ring-primary rounded"
                            name="activo"
                            checked={formData.activo}
                            onChange={handleInputChange}
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">Activo</span>
                    </label>
               </div>

               {/* Campo: Configuración (si aplica, asumiendo texto JSON) */}
                <div className="mb-6">
                    <label htmlFor="configuracion" className="block text-sm font-medium text-gray-700 mb-1">Configuración (JSON)</label>
                    <textarea
                        id="configuracion"
                        name="configuracion"
                        value={formData.configuracion}
                        onChange={handleInputChange}
                        rows="5"
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder='Ej: {"api_key": "...", "merchant_id": "..."}'
                    ></textarea>
                     {updateError && updateError.includes("'Configuración' debe contener JSON válido") && (
                         <p className="mt-1 text-sm text-red-600">Error: JSON inválido en el campo Configuración.</p>
                     )}
                </div>

               {/* Botón de Envío del Formulario (se movió arriba) */}

          </form>

      )} {/* --- Fin de la renderización condicional --- */}

    </div>
  );
}