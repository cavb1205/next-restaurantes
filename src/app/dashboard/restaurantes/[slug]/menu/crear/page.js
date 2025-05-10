// app/dashboard/restaurantes/[slug]/menu/crear/page.js
"use client"; // Este es un Client Component

import { useState, useEffect } from "react"; // Hooks necesarios
import { useParams, useRouter } from "next/navigation"; // Hooks para URL y navegación
import Link from "next/link"; // Para enlaces
// Importa las nuevas funciones de API
import { createProduct, getCategories } from "@/app/services/apiService"; // <<-- Asegúrate de la ruta correcta

// Define un estado inicial para el formulario con todos los campos que esperas enviar al backend
// Usa los nombres de campo exactos que tu Serializador de Producto espera en la entrada POST
const initialFormData = {
  nombre: "",
  descripcion: "",
  precio: "", // Usaremos string para la entrada, convertir a número al enviar
  categoria: "", // Guardará el ID de la categoría seleccionada
  imagen: null, // Usaremos null para la imagen inicialmente, manejará File
  activo: true, // Checkbox por defecto activo
  disponibilidad: "disponible", // Opciones: 'disponible', 'agotado', 'proximamente'
  orden: 0, // Campo numérico para ordenar
  destacado: false, // Checkbox destacado
  // No incluyas 'id', 'restaurante', 'slug', 'created_at', 'updated_at' aquí
};

export default function CreateProductPage() {
  const params = useParams();
  const router = useRouter(); // Hook para redirigir
  const restauranteSlug = params.slug; // Slug del restaurante de la URL

  // Estado para los datos del formulario
  const [formData, setFormData] = useState(initialFormData);
  // Estado para la lista de categorías (para el dropdown)
  const [categories, setCategories] = useState([]);
  // Estado para carga/error al obtener categorías
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);
  // Estado para carga/error al ENVIAR el formulario (crear producto)
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  // Estado para mensajes de éxito después de enviar
  const [successMessage, setSuccessMessage] = useState(null);


  console.log(`[CreateProductPage] Renderizado para slug = ${restauranteSlug}`);

  // --- Efecto para cargar las categorías cuando la página se monta ---
  // Esto es necesario para poblar el dropdown de categoría en el formulario.
  useEffect(() => {
      console.log("[CreateProductPage] Efecto de carga de categorías disparado.");

      const fetchCategoriesData = async () => {
          console.log("[CreateProductPage] Iniciando obtención de categorías...");
          try {
              setLoadingCategories(true); // Activa carga de categorías
              setCategoriesError(null); // Limpia errores previos

              const categoriesList = await getCategories(restauranteSlug); // Llama a la nueva función API

              if (categoriesList) {
                  setCategories(categoriesList); // Guarda la lista de categorías
                  console.log("[CreateProductPage] Categorías obtenidas:", categoriesList);
              } else {
                   setCategories([]); // Si no hay categorías, setea lista vacía
                   console.log("[CreateProductPage] La obtención de categorías retornó vacío o nulo.");
              }

          } catch (err) {
              console.error("[CreateProductPage] Error al obtener categorías:", err);
              setCategoriesError("Error al cargar las categorías."); // Setea error
          } finally {
              setLoadingCategories(false); // Desactiva carga de categorías
              console.log("[CreateProductPage] Finalizada obtención de categorías.");
          }
      };

      fetchCategoriesData(); // Dispara la obtención de categorías

      // Dependencias: Vacío [], solo se ejecuta una vez al montar.
  }, []);


  // --- Manejo de cambios en los campos del formulario ---
  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    // Manejar archivos de tipo 'file' (ej: para la imagen)
    if (type === 'file') {
         // Asumimos que solo subes un archivo por input file
         setFormData({ ...formData, [name]: files[0] });
         console.log(`[handleInputChange] Field ${name} changed. File selected: ${files[0]?.name}`);
    } else {
        // Manejar checkboxes y otros inputs
        const finalValue = type === 'checkbox' ? checked : value;
        setFormData({ ...formData, [name]: finalValue });
        console.log(`[handleInputChange] Field ${name} changed. Value: ${finalValue}`);
    }
  };

  // --- Manejo del envío del formulario ---
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene la recarga por defecto del formulario

    console.log("[CreateProductPage] Formulario enviado. Datos:", formData);

     // Validaciones básicas del lado del cliente (opcional, el backend validará de nuevo)
     if (!formData.nombre || !formData.precio || !formData.categoria) {
         setSubmitError("Por favor, completa los campos obligatorios (Nombre, Precio, Categoría).");
         return; // Detiene el envío si faltan campos básicos
     }
     // Asegura que el precio sea un número antes de intentar convertirlo
      if (isNaN(parseFloat(formData.precio))) {
           setSubmitError("El precio debe ser un número válido.");
           return;
      }


    try {
      setSubmitting(true); // Activa el estado de envío
      setSubmitError(null); // Limpia errores de envío previos
      setSuccessMessage(null); // Limpia mensaje de éxito previo

      // --- Preparar los datos para enviar a la API ---
      // El backend (DRF) espera un objeto JSON (o FormData si manejas imágenes).
      // Si tu Serializador acepta la imagen como archivo, necesitarás usar FormData.
      // Si tu Serializador espera la imagen como Base64 o URL, ajusta aquí.
      // Asumiremos que para la imagen usaremos FormData, que es común con archivos.

      const dataToSubmit = new FormData(); // Usa FormData para enviar archivos y otros datos

      // Añadir todos los campos del formData a FormData, excepto la imagen por ahora
      Object.keys(formData).forEach(key => {
          if (key !== 'imagen' && formData[key] !== null) { // No añadas imagen aquí, y omite nulls
              // Manejar tipos booleanos y numéricos si es necesario, aunque FormData los convierte a string
              const value = (typeof formData[key] === 'boolean' || typeof formData[key] === 'number') ? String(formData[key]) : formData[key];
              dataToSubmit.append(key, value);
          }
      });

      // Añadir el archivo de imagen si existe
      if (formData.imagen) {
          dataToSubmit.append('imagen', formData.imagen); // Añade el archivo al FormData
      }

       // **Nota:** El campo 'categoria' en formData es el ID. FormData.append lo enviará como string,
       // pero DRF's PrimaryKeyRelatedField debería manejar la conversión a ID automáticamente.
       // El campo 'precio' lo convertimos a string para FormData, DRF lo convertirá a Decimal.
       // Los booleanos (activo, destacado) y números (orden) también se convierten a string.

       console.log("[handleSubmit] Data being prepared for API:", Object.fromEntries(dataToSubmit)); // Log FormData (solo entradas simples)


      // ** Llama a la función de la API para crear el producto **
      // createProduct se encargará de usar authenticatedRequest con el método POST
      const newProduct = await createProduct(restauranteSlug, dataToSubmit); // Pasa el slug y los datos preparados

      console.log("[CreateProductPage] createProduct retornó:", newProduct);

      // Si la creación fue exitosa:
      setSuccessMessage("Producto creado exitosamente."); // Muestra un mensaje de éxito
      setFormData(initialFormData); // Limpia el formulario (opcional)

      // Redirige a la página de lista del menú después de un pequeño retraso
      // para que el usuario vea el mensaje de éxito.
      setTimeout(() => {
           // Usa router.push para navegar programáticamente
          router.push(`/dashboard/restaurantes/${restauranteSlug}/menu`);
      }, 1500); // Redirige después de 1.5 segundos

    } catch (err) {
      console.error("[CreateProductPage] Error al crear producto:", err);
      // Manejar errores. Si authenticatedRequest lanza un error HTTP con body (ej: 400 de validación),
      // el error.body contendrá los errores del backend.
      // Asegúrate de que tu apiService adjunte response.body al error si es un error HTTP.
      const errorMessage = err.body?.detail || err.body?.non_field_errors?.[0] || err.message || "Error desconocido al crear producto.";
      // Si son errores de validación por campo (ej: {"precio": ["Enter a number."]}), muestra eso.
      const fieldErrors = err.body || null; // Guarda los errores por campo si existen

      if (fieldErrors && typeof fieldErrors === 'object') {
          // Si el body del error es un objeto (típico de errores de validación por campo de DRF)
           console.error("[CreateProductPage] Errores de validación del backend:", fieldErrors);
           // Podrías mostrar estos errores debajo de cada campo del formulario.
           // Por ahora, solo mostraremos un mensaje general o el primer error del detalle.
           const firstFieldErrorKey = Object.keys(fieldErrors)[0];
           const firstFieldErrorMsg = Array.isArray(fieldErrors[firstFieldErrorKey]) ? fieldErrors[firstFieldErrorKey][0] : fieldErrors[firstFieldErrorKey];
            setSubmitError(`Error de validación: ${firstFieldErrorKey}: ${firstFieldErrorMsg}`);

      } else {
           // Otros tipos de errores (red, permisos, etc.)
           setSubmitError(errorMessage); // Muestra el mensaje general de error
      }

    } finally {
      setSubmitting(false); // Desactiva el estado de envío
      console.log("[CreateProductPage] Finalizado intento de creación.");
    }
  };

  // --- Lógica de Renderizado ---

  // Mostrar pantalla de carga de categorías si aún no se obtuvieron
  if (loadingCategories) {
       console.log("[CreateProductPage] Renderizando Carga de Categorías...");
       return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100">
           <div className="text-center">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
             <p className="text-gray-700 text-lg">Cargando categorías...</p>
           </div>
         </div>
       );
  }

  // Mostrar error si falló la carga de categorías
  if (categoriesError) {
       console.log("[CreateProductPage] Renderizando Error de Categorías...");
       return (
         <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
                <p className="font-semibold text-lg mb-2">Error al cargar categorías:</p>
                <p>{categoriesError}</p>
                {/* Opcional: Botón para reintentar cargar categorías */}
                 {/* <button onClick={fetchCategoriesData} className="mt-4 text-blue-600 hover:underline">Reintentar</button> */}
            </div>
         </div>
       );
  }

  // Si las categorías se cargaron (o no hay ninguna), renderiza el formulario
  console.log("[CreateProductPage] Renderizando Formulario de Creación de Producto...");
  return (
    <div className="container mx-auto py-8 px-4 max-w-2xl"> {/* Contenedor principal centrado y más estrecho */}

        {/* Botón para volver a la lista de menú */}
        <Link href={`/dashboard/restaurantes/${restauranteSlug}/menu`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver al Menú
        </Link>

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Crear Nuevo Producto</h1>

      {/* Formulario de Creación */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md border border-gray-200">

          {/* Mensaje de éxito después de enviar */}
          {successMessage && (
              <div className="bg-green-100 text-green-700 p-4 rounded-md mb-4">
                  {successMessage}
              </div>
          )}

          {/* Mensaje de error general o de envío */}
           {submitError && (
               <div className="bg-red-100 text-red-700 p-4 rounded-md mb-4">
                   {submitError}
               </div>
           )}


           {/* Campo: Nombre del Producto */}
           <div className="mb-4">
               <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
               <input
                   type="text"
                   id="nombre"
                   name="nombre" // <<-- Name debe coincidir con el campo del Serializador
                   value={formData.nombre}
                   onChange={handleInputChange}
                   required // Marcado como requerido en HTML
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
               />
           </div>

           {/* Campo: Descripción */}
           <div className="mb-4">
               <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
               <textarea
                   id="descripcion"
                   name="descripcion" // <<-- Name debe coincidir con el campo del Serializador
                   value={formData.descripcion}
                   onChange={handleInputChange}
                   rows="3" // Altura del textarea
                   className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
               ></textarea>
           </div>

           {/* Campo: Precio */}
            <div className="mb-4">
                <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio <span className="text-red-500">*</span></label>
                <input
                    type="number" // Tipo numérico para teclados móviles y validación básica
                    id="precio"
                    name="precio" // <<-- Name debe coincidir con el campo del Serializador
                    value={formData.precio}
                    onChange={handleInputChange}
                    required // Marcado como requerido
                    step="0.01" // Permite decimales
                    min="0" // Precio mínimo 0
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"
                />
           </div>

           {/* Campo: Categoría (Dropdown) */}
           <div className="mb-4">
               <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
               {/* Si no hay categorías disponibles o cargaron con error, muestra un mensaje */}
               {categories.length === 0 ? (
                    <p className="text-sm text-gray-600 mt-1">No hay categorías disponibles. Asegúrate de tener categorías en el backend.</p>
               ) : (
                   // Si hay categorías, muestra el selector (dropdown)
                    <select
                        id="categoria"
                        name="categoria" // <<-- Name debe coincidir con el campo del Serializador
                        value={formData.categoria}
                        onChange={handleInputChange}
                        required // Marcado como requerido
                         // Deshabilitar si aún cargando categorías o no hay ninguna
                        disabled={loadingCategories || categories.length === 0}
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                    >
                        {/* Opción por defecto "Seleccionar" */}
                        <option value="">-- Seleccionar Categoría --</option>
                        {/* Mapea sobre la lista de categorías obtenida de la API */}
                        {categories.map(category => (
                            // El valor de la opción es el ID de la categoría, el texto mostrado es el nombre.
                            <option key={category.id} value={category.id}>{category.nombre}</option>
                        ))}
                   </select>
               )}
           </div>

           {/* Campo: Imagen (File Input) */}
            <div className="mb-4">
                <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                <input
                    type="file"
                    id="imagen"
                    name="imagen" // <<-- Name debe coincidir con el campo del Serializador (si tu Serializador maneja File)
                    onChange={handleInputChange} // Usa el mismo handler
                    accept="image/*" // Permite solo archivos de imagen
                    className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
                 {/* Opcional: Mostrar nombre del archivo seleccionado */}
                  {formData.imagen && (
                      <p className="mt-2 text-sm text-gray-500">Archivo seleccionado: {formData.imagen.name}</p>
                  )}
            </div>

            {/* Campo: Disponibilidad (Radio Buttons o Select) */}
             <div className="mb-4">
                 <span className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</span>
                 <div className="mt-1 flex gap-4">
                     {/* Opción Disponible */}
                     <label className="inline-flex items-center">
                         <input
                             type="radio"
                             className="form-radio text-primary focus:ring-primary"
                             name="disponibilidad" // <-- Nombre del grupo de radio
                             value="disponible" // <-- Valor a enviar si se selecciona
                             checked={formData.disponibilidad === 'disponible'} // Marcado si coincide con el estado
                             onChange={handleInputChange}
                         />
                         <span className="ml-2 text-gray-700">Disponible</span>
                     </label>
                     {/* Opción Agotado */}
                      <label className="inline-flex items-center">
                         <input
                             type="radio"
                             className="form-radio text-primary focus:ring-primary"
                             name="disponibilidad"
                             value="agotado"
                             checked={formData.disponibilidad === 'agotado'}
                             onChange={handleInputChange}
                         />
                         <span className="ml-2 text-gray-700">Agotado</span>
                     </label>
                     {/* Opción Próximamente */}
                      <label className="inline-flex items-center">
                         <input
                             type="radio"
                             className="form-radio text-primary focus:ring-primary"
                             name="disponibilidad"
                             value="proximamente"
                             checked={formData.disponibilidad === 'proximamente'}
                             onChange={handleInputChange}
                         />
                         <span className="ml-2 text-gray-700">Próximamente</span>
                     </label>
                 </div>
             </div>


           {/* Campo: Activo (Checkbox) */}
            <div className="mb-4">
                 <label className="inline-flex items-center">
                     <input
                         type="checkbox"
                         className="form-checkbox text-primary focus:ring-primary rounded"
                         name="activo" // <-- Nombre del campo
                         checked={formData.activo} // Estado marcado
                         onChange={handleInputChange} // Usa el mismo handler
                     />
                     <span className="ml-2 text-sm font-medium text-gray-700">Activo (Visible en el menú)</span>
                 </label>
            </div>

            {/* Campo: Destacado (Checkbox) */}
            <div className="mb-6"> {/* Más margen abajo antes del botón */}
                 <label className="inline-flex items-center">
                     <input
                         type="checkbox"
                         className="form-checkbox text-primary focus:ring-primary rounded"
                         name="destacado" // <-- Nombre del campo
                         checked={formData.destacado}
                         onChange={handleInputChange}
                     />
                     <span className="ml-2 text-sm font-medium text-gray-700">Destacado (Mostrar en portada, si aplica)</span>
                 </label>
            </div>

            {/* Campo: Orden (Opcional, para ordenación manual) */}
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


          {/* Botón de Envío del Formulario */}
          <button
            type="submit" // Importante que sea type="submit"
            disabled={submitting || loadingCategories} // Deshabilitado si se está enviando o cargando categorías
            className="w-full px-4 py-2 bg-primary text-white font-semibold rounded-lg shadow-md hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? 'Guardando...' : 'Crear Producto'} {/* Cambia texto si está enviando */}
          </button>

      </form>

    </div>
  );
}