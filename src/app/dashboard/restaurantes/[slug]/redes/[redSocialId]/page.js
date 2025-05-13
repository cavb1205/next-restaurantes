// app/dashboard/restaurantes/[slug]/redes/[redSocialId]/page.js (CORREGIDO)
"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { getSocialLinkDetail, updateSocialLink, deleteSocialLink } from "@/app/services/apiService";

// Define un estado inicial CORREGIDO para el formulario
const initialFormData = {
  // <<-- ¡Campo 'tipo' en lugar de 'plataforma'! -->>
  tipo: "", // Se llenará con el valor del backend
  url: "",
  // <<-- ¡Campo 'orden' añadido! -->>
  orden: 0,
  // <<-- ¡Campo 'activo' añadido! -->>
  activo: true, // Se llenará con el valor del backend
  // No incluyas 'id', 'restaurante', 'created_at', 'updated_at'
};

// Opciones de tipo de red social (basadas en tu modelo TIPOS_RED) - Las mismas que en crear/page.js
const socialPlatforms = [
    { value: '', label: '-- Seleccionar Plataforma --' },
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'whatsapp', label: 'WhatsApp' },
    // Añade o modifica según tus tipos exactos
];


export default function SocialLinkDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restauranteSlug = params.slug;
  // **<<-- Obtiene el ID del enlace de la URL -->>**
  const redSocialId = params.redSocialId; // <<-- Usar redSocialId

  const [socialLink, setSocialLink] = useState(null);
  const [loadingLink, setLoadingLink] = useState(true);
  const [linkError, setLinkError] = useState(null);

  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(initialFormData);

  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null);

  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);


  console.log(`[SocialLinkDetailPage] Renderizado para slug = ${restauranteSlug}, redSocialId = ${redSocialId}`);


  // --- Efecto: Cargar detalles al montar ---
  useEffect(() => {
      console.log("[SocialLinkDetailPage] Efecto de carga de detalles disparado.");

      if (!restauranteSlug || !redSocialId) {
          console.warn("[SocialLinkDetailPage] Faltan parámetros en la URL.");
          setLinkError("Información del enlace incompleta en la URL.");
          setLoadingLink(false);
          return;
      }

      const fetchSocialLink = async () => {
          console.log(`[SocialLinkDetailPage] Iniciando obtención de detalles para enlace ${redSocialId}...`);
          try {
              setLoadingLink(true);
              setLinkError(null);
              setSocialLink(null);

              // **<<-- Llama a la función de la API para detalle -->>**
              const socialLinkData = await getSocialLinkDetail(restauranteSlug, redSocialId);

              if (socialLinkData) {
                  setSocialLink(socialLinkData);
                  console.log("[SocialLinkDetailPage] Detalles del enlace obtenidos:", socialLinkData);

                  // **<<-- Inicializar formData con los datos CORREGIDOS -->>**
                  setFormData({
                       // <<-- Usar 'tipo' en lugar de 'plataforma' -->>
                       tipo: socialLinkData.tipo || "", // <-- Usar tipo
                       url: socialLinkData.url || "",
                       // <<-- Incluir 'orden' -->>
                       orden: socialLinkData.orden != null ? socialLinkData.orden : 0, // <-- Incluir orden
                       // <<-- Incluir 'activo' -->>
                       activo: socialLinkData.activo ?? true, // <-- Incluir activo
                  });
                   console.log("[SocialLinkDetailPage] Estado del formulario inicializado.");

              } else {
                   setSocialLink(null);
                    console.log(`[SocialLinkDetailPage] Obtención de detalles para enlace ${redSocialId} retornó vacío o nulo.`);
                    setLinkError(`No se encontraron detalles para el enlace con ID ${redSocialId}.`);
               }

          } catch (err) {
              console.error(`[SocialLinkDetailPage] Error al obtener detalles del enlace ${redSocialId}:`, err);
              setLinkError(`Error al cargar los detalles del enlace ${redSocialId}.`);
          } finally {
              setLoadingLink(false);
               console.log("[SocialLinkDetailPage] Finalizada obtención de detalles del enlace.");
          }
      };

       fetchSocialLink();

  }, [restauranteSlug, redSocialId]); // Dependencias


   // --- Manejo de cambios en el formulario ---
   const handleInputChange = (e) => {
     const { name, value, type, checked } = e.target;
     const finalValue = type === 'checkbox' ? checked : value;
     setFormData({ ...formData, [name]: finalValue });
     console.log(`[handleInputChange] Field ${name} changed. Value: ${finalValue}`);
   };


  // --- Manejo de envío (ACTUALIZAR) ---
  const handleUpdateSubmit = async (e) => {
      e.preventDefault();

      console.log("[SocialLinkDetailPage] Formulario de edición enviado. Datos:", formData);

       // Validaciones básicas
     if (!formData.tipo || !formData.url) {
         setUpdateError("Por favor, completa los campos obligatorios (Plataforma, URL).");
         setUpdateSuccess(null);
         return;
     }
      try {
          new URL(formData.url);
      } catch (urlError) {
           setUpdateError("Por favor, ingresa una URL válida.");
           console.error("Invalid URL:", urlError);
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
             // <<-- Usar 'tipo' en lugar de 'plataforma' -->>
             tipo: formData.tipo, // Enviar valor string del selector
             // <<-- Incluir 'orden' y convertir a número -->>
             orden: parseInt(formData.orden, 10), // Convertir a entero
              // <<-- Incluir 'activo' como booleano -->>
             activo: formData.activo, // Enviar valor booleano
        };

       console.log("[handleUpdateSubmit] Data being prepared for API:", dataToSubmit);


        // ** Llama a la función de la API para actualizar **
        const updatedSocialLinkData = await updateSocialLink(restauranteSlug, redSocialId, dataToSubmit);

        console.log("[SocialLinkDetailPage] updateSocialLink retornó:", updatedSocialLinkData);

        // Si la actualización fue exitosa
        setUpdateSuccess("Enlace de red social actualizado exitosamente.");
        setSocialLink(updatedSocialLinkData); // Actualiza los datos mostrados
        setIsEditing(false); // Sale del modo edición

         setUpdateError(null); // Limpia errores


      } catch (err) {
        console.error("[SocialLinkDetailPage] Error al actualizar enlace de red social:", err);
        const errorMessage = err.body?.detail || err.body?.non_field_errors?.[0] || err.message || "Error desconocido al actualizar enlace de red social.";
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
        console.log("[SocialLinkDetailPage] Finalizado intento de actualización.");
      }
  };


    // --- Manejo de botón ELIMINAR ---
    const handleDelete = async () => {
        console.log(`[SocialLinkDetailPage] Intentando eliminar enlace ${redSocialId}...`);

        // Confirmación (usando la plataforma o URL)
        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el enlace de "${socialLink?.tipo || socialLink?.url || 'este enlace'}"?`);
        if (!confirmDelete) {
            console.log("[SocialLinkDetailPage] Eliminación cancelada por el usuario.");
            return;
        }

        try {
            setDeleting(true);
            setDeleteError(null);

            // ** Llama a la función de la API para eliminar **
            await deleteSocialLink(restauranteSlug, redSocialId);

            console.log(`[SocialLinkDetailPage] Enlace ${redSocialId} eliminado exitosamente.`);

            // Redirige a la lista
            router.push(`/dashboard/restaurantes/${restauranteSlug}/redes`);

        } catch (err) {
             console.error(`[SocialLinkDetailPage] Error al eliminar enlace ${redSocialId}:`, err);
             const errorMessage = err.body?.detail || err.message || "Error desconocido al eliminar enlace de red social.";
             setDeleteError(`Error al eliminar el enlace: ${errorMessage}`);
        } finally {
             setDeleting(false);
             console.log("[SocialLinkDetailPage] Finalizado intento de eliminación.");
        }
    };


  // --- Lógica de Renderizado ---

  // Mostrar carga inicial
  if (loadingLink) {
     console.log("[SocialLinkDetailPage] Renderizando Carga Inicial...");
    return ( /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">Cargando enlace...</p>
        </div>
      </div>
    );
  }

  // Mostrar error si falló la carga inicial
  if (linkError && !socialLink) {
     console.log("[SocialLinkDetailPage] Renderizando Pantalla de Error...");
    return ( /* ... (Código de pantalla de error) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
         <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
             <p className="font-semibold text-lg mb-2">Error al cargar el enlace:</p>
             <p>{linkError}</p>
              <Link href={`/dashboard/restaurantes/${restauranteSlug}/redes`} className="mt-4 inline-block text-blue-600 hover:underline">Volver a la lista</Link>
         </div>
      </div>
    );
  }

  // Si llegamos aquí, el enlace cargó.
  console.log(`[SocialLinkDetailPage] Renderizando ${isEditing ? 'Formulario de Edición' : 'Vista de Detalle'}.`);


  // Si socialLink es null en este punto, es un estado inesperado si no hubo error.
  if (!socialLink) {
       console.warn("[SocialLinkDetailPage] Estado inesperado: socialLink es null pero no hubo error de carga inicial.");
        return (
           <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="bg-gray-100 text-gray-700 p-6 rounded-lg shadow-md">
                    <p>No se pudieron mostrar los detalles. Intenta recargar la página.</p>
               </div>
           </div>
       );
  }


  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl"> {/* Contenedor principal */}

        {/* Botón para volver a la lista */}
        <Link href={`/dashboard/restaurantes/${restauranteSlug}/redes`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver a Redes Sociales
        </Link>

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
         {isEditing ? 'Editar Enlace:' : 'Detalle del Enlace:'} {socialLink.tipo || 'Sin Plataforma'}
      </h1>

      {/* Sección de Botón Eliminar */}
       {/* Muestra el botón eliminar solo en modo viendo */}
      {!isEditing && (
           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 flex justify-between items-center">
               <h2 className="text-xl font-semibold text-gray-800">Eliminar Enlace</h2>
                {deleteError && (
                     <div className="bg-red-100 text-red-700 p-3 rounded-md mr-4">
                         {deleteError}
                     </div>
                 )}
               <button
                   onClick={handleDelete}
                   disabled={deleting || updating || loadingLink}
                   className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   {deleting ? 'Eliminando...' : 'Eliminar Enlace'}
               </button>
            </div>
      )}


      {/* ** <<-- Renderiza VISTA DE DETALLE o FORMULARIO DE EDICIÓN condicionalmente -->> ** */}

      {!isEditing ? ( // --- Si NO estamos editando, muestra la vista de detalle ---
           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8">
               <h2 className="text-xl font-semibold text-gray-800 mb-4">Detalles</h2>

                {/* Botón Editar para cambiar al modo edición */}
               <div className="flex justify-end gap-4 mb-4">
                    {/* Mensaje de éxito de actualización (si se muestra en modo vista) */}
                     {updateSuccess && (
                         <div className="bg-green-100 text-green-700 p-2 rounded-md text-sm flex items-center">
                             {updateSuccess}
                         </div>
                     )}
                    {/* Mensaje de error de actualización (si se muestra en modo vista) */}
                     {updateError && (
                         <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm flex items-center">
                             {updateError}
                         </div>
                     )}
                   <button
                       onClick={() => setIsEditing(true)}
                        disabled={updating || deleting || loadingLink}
                       className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Editar Enlace
                   </button>
               </div>

               {/* Mostrar los detalles */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   {/* Tipo */}
                   <p className="capitalize"><span className="font-semibold text-gray-700">Plataforma:</span> {socialLink.tipo || 'N/A'}</p> {/* Muestra tipo */}
                    {/* URL */}
                    <p><span className="font-semibold text-gray-700">URL:</span>
                        <a href={socialLink.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                            {socialLink.url || 'Sin URL'}
                        </a>
                   </p>
                     {/* Orden */}
                    <p><span className="font-semibold text-gray-700">Orden:</span> {socialLink.orden != null ? socialLink.orden : 'N/A'}</p> {/* Muestra orden */}
                     {/* Activo */}
                    <p><span className="font-semibold text-gray-700">Activo:</span> {socialLink.activo ? 'Sí' : 'No'}</p> {/* Muestra activo */}

                     {/* Fechas */}
                     <p><span className="font-semibold text-gray-700">Creado:</span> {socialLink.created_at ? new Date(socialLink.created_at).toLocaleString() : 'N/A'}</p>
                     <p><span className="font-semibold text-gray-700">Actualizado:</span> {socialLink.updated_at ? new Date(socialLink.updated_at).toLocaleString() : 'N/A'}</p>
               </div>

           </div>

      ) : ( // --- Si SÍ estamos editando, muestra el formulario ---

          <form onSubmit={handleUpdateSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Formulario de Edición</h2>

              {/* Botones de Guardar y Cancelar */}
               <div className="flex justify-end gap-4 mb-4">
                    {updateSuccess && ( /* ... */ <div className="bg-green-100 text-green-700 p-2 rounded-md text-sm flex items-center">{updateSuccess}</div> )}
                    {updateError && ( /* ... */ <div className="bg-red-100 text-red-700 p-2 rounded-md text-sm flex items-center">{updateError}</div> )}

                   <button type="button" onClick={() => {
                        setIsEditing(false);
                        // Opcional: Resetear formData a los datos originales
                        if(socialLink) {
                            setFormData({
                                tipo: socialLink.tipo || "", // Usar tipo
                                url: socialLink.url || "",
                                orden: socialLink.orden != null ? socialLink.orden : 0, // Usar orden
                                activo: socialLink.activo ?? true, // Usar activo
                            });
                        }
                        setUpdateError(null); setUpdateSuccess(null);
                   }} disabled={updating} className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                       Cancelar
                   </button>
                  <button type="submit" disabled={updating || deleting} className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
                    {updating ? 'Guardando Cambios...' : 'Guardar Cambios'}
                  </button>
               </div>


             {/* --- Campos del Formulario (adaptados) --- */}
              {/* Campo: Tipo (Selector) */}
              <div className="mb-4">
                  <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Plataforma <span className="text-red-500">*</span></label>
                  <select
                      id="tipo"
                      name="tipo" // Nombre del campo: 'tipo'
                      value={formData.tipo}
                      onChange={handleInputChange}
                      required
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                  >
                      {socialPlatforms.map(option => (
                          <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                  </select>
              </div>

               {/* Campo: URL */}
               <div className="mb-4">
                   <label htmlFor="url" className="block text-sm font-medium text-gray-700 mb-1">URL <span className="text-red-500">*</span></label>
                   <input type="url" id="url" name="url" value={formData.url} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm" placeholder="Ej: https://www.instagram.com/tu_restaurante/" />
               </div>

                {/* Campo: Orden */}
                 <div className="mb-4">
                     <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                     <input type="number" id="orden" name="orden" value={formData.orden} onChange={handleInputChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm" />
                 </div>

                {/* Campo: Activo (Checkbox) */}
               <div className="mb-6">
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="form-checkbox text-primary focus:ring-primary rounded" name="activo" checked={formData.activo} onChange={handleInputChange} />
                        <span className="ml-2 text-sm font-medium text-gray-700">Activo (Visible)</span>
                    </label>
               </div>


               {/* Botón de Envío (se movió arriba) */}

          </form>

      )} {/* --- Fin de la renderización condicional --- */}

    </div>
  );
}