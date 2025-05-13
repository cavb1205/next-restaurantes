// app/dashboard/restaurantes/[slug]/redes/crear/page.js (CORREGIDO)
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { createSocialLink } from "@/app/services/apiService";

// Define un estado inicial CORREGIDO con los campos reales del modelo RedSocial
const initialFormData = {
  // <<-- ¡Campo 'tipo' en lugar de 'plataforma'! -->>
  tipo: "", // Usaremos un selector
  url: "",
  // <<-- ¡Campo 'orden' añadido! -->>
  orden: 0,
  // <<-- ¡Campo 'activo' añadido! -->>
  activo: true, // Checkbox por defecto activo
  // No incluyas 'id', 'restaurante', 'created_at', 'updated_at'
};

// Opciones de tipo de red social (basadas en tu modelo TIPOS_RED)
const socialPlatforms = [
    { value: '', label: '-- Seleccionar Plataforma --' },
    // Estos valores deben coincidir exactamente con las claves de tu TIPOS_RED en Django
    { value: 'facebook', label: 'Facebook' },
    { value: 'instagram', label: 'Instagram' },
    { value: 'twitter', label: 'Twitter' },
    { value: 'tiktok', label: 'TikTok' },
    { value: 'youtube', label: 'YouTube' },
    { value: 'whatsapp', label: 'WhatsApp' },
    // Añade o modifica según tus tipos exactos
];


export default function CreateSocialLinkPage() {
  const params = useParams();
  const router = useRouter();
  const restauranteSlug = params.slug;

  const [formData, setFormData] = useState(initialFormData);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  console.log(`[CreateSocialLinkPage] Renderizado para slug = ${restauranteSlug}`);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const finalValue = type === 'checkbox' ? checked : value;
    setFormData({ ...formData, [name]: finalValue });
    console.log(`[handleInputChange] Field ${name} changed. Value: ${finalValue}`);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("[CreateSocialLinkPage] Formulario enviado. Datos:", formData);

     // Validaciones básicas
     // <<-- Validar 'tipo' y 'url' -->>
     if (!formData.tipo || !formData.url) {
         setSubmitError("Por favor, completa los campos obligatorios (Plataforma, URL).");
         return;
     }
      try {
          new URL(formData.url); // Intenta crear un objeto URL
      } catch (urlError) {
           setSubmitError("Por favor, ingresa una URL válida.");
           console.error("Invalid URL:", urlError);
           return;
      }


    try {
      setSubmitting(true);
      setSubmitError(null);
      setSuccessMessage(null);

      // Preparar los datos para enviar
      const dataToSubmit = {
          ...formData,
           // <<-- Campo 'tipo' en lugar de 'plataforma' -->>
           tipo: formData.tipo, // Envía el valor seleccionado del selector
           // <<-- Incluir 'orden' y convertir a número -->>
           orden: parseInt(formData.orden, 10), // Convierte a entero
            // <<-- Incluir 'activo' como booleano -->>
           activo: formData.activo, // Envía el valor booleano del checkbox
      };

       console.log("[handleSubmit] Data being prepared for API:", dataToSubmit);

      // Llama a la API para crear
      const newSocialLink = await createSocialLink(restauranteSlug, dataToSubmit);

      console.log("[CreateSocialLinkPage] createSocialLink retornó:", newSocialLink);

      // Si la creación fue exitosa
      setSuccessMessage("Enlace de red social creado exitosamente.");
      setFormData(initialFormData);

      // Redirige a la lista
      setTimeout(() => {
           router.push(`/dashboard/restaurantes/${restauranteSlug}/redes`);
      }, 1500);

    } catch (err) {
      console.error("[CreateSocialLinkPage] Error al crear enlace de red social:", err);
      const errorMessage = err.body?.detail || err.body?.non_field_errors?.[0] || err.message || "Error desconocido al crear enlace de red social.";
      const fieldErrors = err.body || null;

      if (fieldErrors && typeof fieldErrors === 'object') {
           console.error("[CreateSocialLinkPage] Errores de validación del backend:", fieldErrors);
           const firstFieldErrorKey = Object.keys(fieldErrors)[0];
           const firstFieldErrorMsg = Array.isArray(fieldErrors[firstFieldErrorKey]) ? fieldErrors[firstFieldErrorKey][0] : fieldErrors[firstFieldErrorKey];
            setSubmitError(`Error de validación: ${firstFieldErrorKey}: ${firstFieldErrorMsg}`);

      } else {
           setSubmitError(errorMessage);
      }
      setSuccessMessage(null);

    } finally {
      setSubmitting(false);
      console.log("[CreateSocialLinkPage] Finalizado intento de creación.");
    }
  };


  // --- Lógica de Renderizado ---
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl">

        <Link href={`/dashboard/restaurantes/${restauranteSlug}/redes`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver a Redes Sociales
        </Link>

      <h1 className="text-3xl font-bold text-gray-800 mb-8">Añadir Nuevo Enlace de Red Social</h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">

          {successMessage && ( /* ... */ <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">{successMessage}</div> )}
          {submitError && ( /* ... */ <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">{submitError}</div> )}


           {/* Campo: Tipo (Selector, antes Plataforma) */}
           <div className="mb-4">
               <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">Plataforma <span className="text-red-500">*</span></label>
               <select
                   id="tipo"
                   name="tipo" // <<-- Nombre del campo: 'tipo'
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


          {/* Botón de Envío */}
          <button type="submit" disabled={submitting} className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed">
            {submitting ? 'Guardando...' : 'Crear Enlace'}
          </button>

      </form>

    </div>
  );
}