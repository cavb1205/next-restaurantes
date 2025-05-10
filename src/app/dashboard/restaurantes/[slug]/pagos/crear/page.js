// app/dashboard/restaurantes/[slug]/pagos/crear/page.js
"use client"; // Client Component

import { useState } from "react"; // Hook useState
import { useParams, useRouter } from "next/navigation"; // Hooks para URL y navegación
import Link from "next/link"; // Para enlaces
// Importa la función para crear método de pago
import { createPaymentMethod } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

// Define un estado inicial para el formulario con los campos del modelo MetodoPago
// Usa los nombres de campo exactos que tu Serializador de MetodoPago espera en la entrada POST
const initialFormData = {
  tipo: "", // Usaremos un selector para esto
  descripcion: "",
  orden: 0,
  activo: true, // Checkbox por defecto activo
  configuracion: "", // Campo para JSON u otra configuración (lo trataremos como texto por ahora)
  // No incluyas 'id', 'restaurante', 'created_at', 'updated_at'
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


export default function CreatePaymentMethodPage() {
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


  console.log(`[CreatePaymentMethodPage] Renderizado para slug = ${restauranteSlug}`);

  // --- Manejo de cambios en los campos del formulario ---
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Manejar checkboxes y otros inputs
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: finalValue });
    console.log(`[handleInputChange] Field ${name} changed. Value: ${finalValue}`);
  };

  // --- Manejo del envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene la recarga

    console.log("[CreatePaymentMethodPage] Formulario enviado. Datos:", formData);

     // Validaciones básicas del lado del cliente
     if (!formData.tipo || !formData.descripcion) {
         setSubmitError("Por favor, completa los campos obligatorios (Tipo, Descripción).");
         return;
     }
     // Opcional: Validación básica para el campo 'configuracion' si esperas un JSON válido
     if (formData.configuracion) {
         try {
             JSON.parse(formData.configuracion); // Intenta parsear como JSON
         } catch (jsonError) {
              setSubmitError("El campo 'Configuración' debe contener JSON válido.");
              console.error("Error parsing configuracion JSON:", jsonError);
              return;
         }
     }


    try {
      setSubmitting(true); // Activa el estado de envío
      setSubmitError(null); // Limpia errores previos
      setSuccessMessage(null); // Limpia mensaje de éxito previo

      // --- Preparar los datos para enviar a la API ---
      // La mayoría de los campos de MetodoPago son tipos simples (string, bool, int).
      // No suele haber archivos, así que podemos enviar JSON directamente (authenticatedRequest lo serializará).
      // Asegúrate de que los tipos booleanos y numéricos se envíen correctamente (string para FormData o JSON.stringify los maneja).
      // El campo 'configuracion' si existe y no está vacío, conviértelo a objeto JSON si lo guardas como JSONField en Django.
      // Si tu backend espera el campo 'configuracion' como string JSON, no necesitas parsearlo aquí.

       const dataToSubmit = {
           ...formData,
           // Si el campo 'configuracion' es JSONField en Django y esperas un objeto:
           // configuracion: formData.configuracion ? JSON.parse(formData.configuracion) : null, // Si el campo permite null
           // Si el campo 'configuracion' es JSONField en Django y esperas un objeto vacío si está vacío:
           configuracion: formData.configuracion ? JSON.parse(formData.configuracion) : {}, // Si esperas un objeto vacío en lugar de null

           // Si el campo 'configuracion' es CharField o TextField que guarda JSON string:
           // configuracion: formData.configuracion || "", // Envía el string o vacío

            // Asegura que los booleanos se envíen como booleanos si authenticatedRequest los maneja (JSON.stringify sí)
            activo: formData.activo,
            destacado: formData.destacado, // Si tienes campo destacado en MetodoPago

            // Asegura que el orden sea un número si lo guardas como IntegerField
            orden: parseInt(formData.orden, 10), // Convierte a entero base 10
       };


       console.log("[handleSubmit] Data being prepared for API:", dataToSubmit);


      // ** Llama a la función de la API para crear el método de pago **
      // createPaymentMethod se encargará de usar authenticatedRequest con POST
      const newMethod = await createPaymentMethod(restauranteSlug, dataToSubmit); // Pasa el slug y los datos preparados

      console.log("[CreatePaymentMethodPage] createPaymentMethod retornó:", newMethod);

      // Si la creación fue exitosa:
      setSuccessMessage("Método de pago creado exitosamente.");
      setFormData(initialFormData); // Limpia el formulario (opcional)

      // Redirige a la página de lista de métodos de pago después de un pequeño retraso
      setTimeout(() => {
           router.push(`/dashboard/restaurantes/${restauranteSlug}/pagos`); // Redirige a la lista de pagos
      }, 1500); // Redirige después de 1.5 segundos

    } catch (err) {
      console.error("[CreatePaymentMethodPage] Error al crear método de pago:", err);
      // Manejar errores. Si authenticatedRequest lanza un error HTTP con body (ej: 400 de validación),
      // el error.body contendrá los errores del backend.
      const errorMessage = err.body?.detail || err.body?.non_field_errors?.[0] || err.message || "Error desconocido al crear método de pago.";
      const fieldErrors = err.body || null; // Guarda los errores por campo

      if (fieldErrors && typeof fieldErrors === 'object') {
           console.error("[CreatePaymentMethodPage] Errores de validación del backend:", fieldErrors);
           const firstFieldErrorKey = Object.keys(fieldErrors)[0];
           const firstFieldErrorMsg = Array.isArray(fieldErrors[firstFieldErrorKey]) ? fieldErrors[firstFieldErrorKey][0] : fieldErrors[firstFieldErrorKey];
            setSubmitError(`Error de validación: ${firstFieldErrorKey}: ${firstFieldErrorMsg}`);

      } else {
           setSubmitError(errorMessage);
      }
      setSuccessMessage(null);

    } finally {
      setSubmitting(false); // Desactiva el estado de envío
      console.log("[CreatePaymentMethodPage] Finalizado intento de creación.");
    }
  };


  // --- Lógica de Renderizado ---
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl"> {/* Contenedor principal */}

        {/* Botón para volver a la lista */}
        <Link href={`/dashboard/restaurantes/${restauranteSlug}/pagos`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver a Métodos de Pago
        </Link>

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Añadir Nuevo Método de Pago</h1>

      {/* Formulario de Creación */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">

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


           {/* Campo: Tipo (Selector) */}
           <div className="mb-4">
               <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Tipo <span className="text-red-500">*</span></label>
               <select
                   id="tipo"
                   name="tipo" // <<-- Name debe coincidir con el campo del Serializador
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
                   name="descripcion" // <<-- Name debe coincidir con el campo del Serializador
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
                     name="orden" // <<-- Name debe coincidir con el campo del Serializador
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
                         name="activo" // <<-- Name debe coincidir con el campo del Serializador
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
                     name="configuracion" // <<-- Name debe coincidir con el campo del Serializador
                     value={formData.configuracion}
                     onChange={handleInputChange}
                     rows="5"
                     className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 font-mono text-sm focus:ring-primary focus:border-primary sm:text-sm"
                     placeholder='Ej: {"api_key": "...", "merchant_id": "..."}'
                 ></textarea>
                 {submitError && submitError.includes("'Configuración' debe contener JSON válido") && (
                      <p className="mt-1 text-sm text-red-600">Error: JSON inválido en el campo Configuración.</p>
                 )}
             </div>


          {/* Botón de Envío del Formulario */}
          <button
            type="submit"
            disabled={submitting} // Deshabilitado si se está enviando
            className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Crear Método de Pago'}
          </button>

      </form>

    </div>
  );
}