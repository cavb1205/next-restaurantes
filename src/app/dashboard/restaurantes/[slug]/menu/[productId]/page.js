// app/dashboard/restaurantes/[slug]/menu/[productId]/page.js
"use client"; // Este es un Client Component

import { useState, useEffect } from "react"; // Hooks necesarios
import { useParams, useRouter } from "next/navigation"; // Hooks para URL y navegación
import Link from "next/link"; // Para enlaces
import Image from 'next/image'; // Para mostrar imágenes
// Importa las funciones de API
import { getProductDetail, updateProduct, deleteProduct, getCategories } from "@/app/services/apiService"; // Asegúrate de la ruta correcta

// Define un estado inicial para el formulario (se llenará con los datos del producto)
const initialFormData = {
  nombre: "",
  descripcion: "",
  precio: "",
  categoria: "", // Guardará el ID de la categoría seleccionada
  imagen: null, // Puede ser la URL de la imagen existente o un nuevo File para subir
  activo: true,
  disponibilidad: "disponible",
  orden: 0,
  destacado: false,
};


export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const restauranteSlug = params.slug;
  const productId = params.productId;

  // Estado para los datos del producto (los que se cargan inicialmente)
  const [product, setProduct] = useState(null);
  // Estado para la carga inicial del producto
  const [loadingProduct, setLoadingProduct] = useState(true);
  const [productError, setProductError] = useState(null);

  // **<<-- NUEVO ESTADO: Controla si estamos en modo edición -->>**
  const [isEditing, setIsEditing] = useState(false); // Inicia en modo "viendo"

  // Estado para los datos del formulario de edición (inicializados desde el producto cargado)
  const [formData, setFormData] = useState(initialFormData);
  // Estado para la lista de categorías (para el dropdown de edición)
  const [categories, setCategories] = useState([]);
  // Estado para carga/error al obtener categorías
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [categoriesError, setCategoriesError] = useState(null);

  // Estado para la acción de ACTUALIZAR el producto (envío del formulario)
  const [updating, setUpdating] = useState(false);
  const [updateError, setUpdateError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(null); // Mensaje de éxito de actualización

  // Estado para la acción de ELIMINAR el producto
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState(null);


  console.log(`[ProductDetailPage] Renderizado para slug = ${restauranteSlug}, productId = ${productId}`);


  // --- Efecto 1: Cargar los detalles del producto y las categorías al montar ---
  useEffect(() => {
      console.log("[ProductDetailPage] Efecto de carga de detalles y categorías disparado.");

      if (!restauranteSlug || !productId) {
          console.warn("[ProductDetailPage] Faltan parámetros en la URL.");
          setProductError("Información del producto incompleta en la URL.");
          setLoadingProduct(false);
          setLoadingCategories(false);
          return;
      }

      // Función asíncrona para obtener detalles del producto
      const fetchProduct = async () => {
          console.log(`[ProductDetailPage] Iniciando obtención de detalles para producto ${productId}...`);
          try {
              setLoadingProduct(true);
              setProductError(null);
              setProduct(null); // Limpia datos previos

              const productData = await getProductDetail(restauranteSlug, productId);

              if (productData) {
                  setProduct(productData); // Guarda los datos del producto
                  console.log("[ProductDetailPage] Detalles del producto obtenidos:", productData);

                  // **<<-- Inicializar el estado del formulario con los datos del producto -->>**
                  // Esto se hace siempre al cargar el producto, independientemente del modo (viendo/editando)
                  setFormData({
                       nombre: productData.nombre || "",
                       descripcion: productData.descripcion || "",
                       precio: productData.precio != null ? String(productData.precio) : "",
                       categoria: productData.categoria || "",
                       imagen: null, // Siempre inicia el input file vacío en el formulario
                       activo: productData.activo ?? true,
                       disponibilidad: productData.disponibilidad || "disponible",
                       orden: productData.orden != null ? productData.orden : 0,
                       destacado: productData.destacado ?? false,
                  });
                   console.log("[ProductDetailPage] Estado del formulario inicializado."); // El estado se actualiza async.

              } else {
                   setProduct(null);
                    console.log(`[ProductDetailPage] Obtención de detalles para producto ${productId} retornó vacío o nulo.`);
                    setProductError(`No se encontraron detalles para el producto con ID ${productId}.`);
               }

          } catch (err) {
              console.error(`[ProductDetailPage] Error al obtener detalles del producto ${productId}:`, err);
              setProductError(`Error al cargar los detalles del producto ${productId}.`);
          } finally {
              setLoadingProduct(false);
               console.log("[ProductDetailPage] Finalizada obtención de detalles del producto.");
          }
      };

      // Función asíncrona para obtener categorías (necesario para el formulario de edición)
       const fetchCategoriesData = async () => {
           console.log("[ProductDetailPage] Iniciando obtención de categorías para formulario...");
           try {
               setLoadingCategories(true);
               setCategoriesError(null);

               const categoriesList = await getCategories(restauranteSlug);

               if (categoriesList) {
                   setCategories(categoriesList);
                   console.log("[ProductDetailPage] Categorías obtenidas para formulario:", categoriesList);
               } else {
                    setCategories([]);
                    console.log("[ProductDetailPage] Obtención de categorías para formulario retornó vacío o nulo.");
               }

           } catch (err) {
               console.error("[ProductDetailPage] Error al obtener categorías para formulario:", err);
               setCategoriesError("Error al cargar las categorías para el formulario.");
           } finally {
               setLoadingCategories(false);
               console.log("[ProductDetailPage] Finalizada obtención de categorías para formulario.");
           }
       };


       fetchProduct(); // Dispara la obtención del producto
       fetchCategoriesData(); // Dispara la obtención de categorías

    // Dependencias: productId y restauranteSlug
  }, [restauranteSlug, productId]); // Añade getProductDetail, getCategories si eslint lo pide


   // --- Manejo de cambios en los campos del formulario de edición ---
   const handleInputChange = (e) => {
     const { name, value, type, checked, files } = e.target;

     if (type === 'file') {
          setFormData({ ...formData, [name]: files[0] });
          console.log(`[handleInputChange] Field ${name} changed. File selected: ${files[0]?.name}`);
     } else {
         const finalValue = type === 'checkbox' ? checked : value;
         setFormData({ ...formData, [name]: finalValue });
         console.log(`[handleInputChange] Field ${name} changed. Value: ${finalValue}`);
     }
   };


  // --- Manejo del envío del formulario de edición (ACTUALIZAR) ---
  const handleUpdateSubmit = async (e) => {
      e.preventDefault();

      console.log("[ProductDetailPage] Formulario de edición enviado. Datos:", formData);

       // Validaciones básicas (cliente)
      if (!formData.nombre || !formData.precio || !formData.categoria) {
          setUpdateError("Por favor, completa los campos obligatorios (Nombre, Precio, Categoría).");
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

        // Preparar los datos para enviar (FormData)
        const dataToSubmit = new FormData();

        // Añadir todos los campos del formData a FormData, excepto la imagen si es null
        // Es mejor enviar todos los campos editables incluso si no cambiaron, el backend PATCH los ignorará si no han sido modificados o los actualizará si sí.
        // Para la imagen, solo añadir si es un nuevo archivo (instancia de File).
         Object.keys(initialFormData).forEach(key => {
             if (key === 'imagen') {
                  if (formData.imagen instanceof File) {
                       dataToSubmit.append('imagen', formData.imagen);
                   }
                 // Si quieres permitir borrar la imagen, tu backend debe aceptar un valor específico (ej: null, "") para el campo 'imagen' en PATCH.
                 // Si envías formData.append('imagen', '') cuando no hay archivo, algunos backends lo interpretan como "borrar".
                 // Si formData.imagen es null (estado inicial del input file) y product.imagen existía, no enviamos el campo 'imagen' en FormData por defecto.
             } else if (formData[key] !== null) { // Añade otros campos si no son null
                  // Convertir booleanos y números a string para FormData
                   const value = (typeof formData[key] === 'boolean' || typeof formData[key] === 'number') ? String(formData[key]) : formData[key];
                   dataToSubmit.append(key, value);
             }
         });


       console.log("[handleUpdateSubmit] Data being prepared for API:", Object.fromEntries(dataToSubmit)); // Log FormData


        // Llama a la API para actualizar el producto
        const updatedProductData = await updateProduct(restauranteSlug, productId, dataToSubmit);

        console.log("[ProductDetailPage] updateProduct retornó:", updatedProductData);

        // Si la actualización fue exitosa:
        setUpdateSuccess("Producto actualizado exitosamente.");
        setProduct(updatedProductData); // Actualiza los datos mostrados con la respuesta del API
        // **<<-- Vuelve al modo "viendo" después de actualizar -->>**
        setIsEditing(false); // Sale del modo edición

        // Limpiar errores de validación previos (opcional)
         setUpdateError(null);


      } catch (err) {
        console.error("[ProductDetailPage] Error al actualizar producto:", err);
        // Manejar errores de actualización
        const errorMessage = err.body?.detail || err.body?.non_field_errors?.[0] || err.message || "Error desconocido al actualizar producto.";
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
        console.log("[ProductDetailPage] Finalizado intento de actualización.");
      }
  };


    // --- Manejo del botón ELIMINAR ---
    const handleDelete = async () => {
        console.log(`[ProductDetailPage] Intentando eliminar producto ${productId}...`);

        const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el producto "${product?.nombre || 'este producto'}"?`);
        if (!confirmDelete) {
            console.log("[ProductDetailPage] Eliminación cancelada por el usuario.");
            return;
        }

        try {
            setDeleting(true);
            setDeleteError(null);

            // Llama a la API para eliminar el producto
            await deleteProduct(restauranteSlug, productId);

            console.log(`[ProductDetailPage] Producto ${productId} eliminado exitosamente.`);

            // Redirige de vuelta a la página de lista del menú
            router.push(`/dashboard/restaurantes/${restauranteSlug}/menu`);

        } catch (err) {
             console.error(`[ProductDetailPage] Error al eliminar producto ${productId}:`, err);
             const errorMessage = err.body?.detail || err.message || "Error desconocido al eliminar producto.";
             setDeleteError(`Error al eliminar el producto: ${errorMessage}`);
        } finally {
             setDeleting(false);
             console.log("[ProductDetailPage] Finalizado intento de eliminación.");
        }
    };


  // --- Lógica de Renderizado ---

  // Mostrar carga inicial
  if (loadingProduct || loadingCategories) {
     console.log("[ProductDetailPage] Renderizando Carga Inicial...");
    return ( /* ... (Código de pantalla de carga) ... */
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
          <p className="text-gray-700 text-lg">{loadingProduct ? 'Cargando producto...' : 'Cargando categorías...'}</p>
        </div>
      </div>
    );
  }

  // Mostrar error si falló la carga inicial del producto
  if (productError && !product) {
     console.log("[ProductDetailPage] Renderizando Error de Producto...");
    return ( /* ... (Código de pantalla de error de producto) ... */
      <div className="container mx-auto py-10 px-4 max-w-4xl">
         <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
             <p className="font-semibold text-lg mb-2">Error al cargar el producto:</p>
             <p>{productError}</p>
              <Link href={`/dashboard/restaurantes/${restauranteSlug}/menu`} className="mt-4 inline-block text-blue-600 hover:underline">Volver a la lista del menú</Link>
         </div>
      </div>
    );
  }

   // Mostrar error si falló la carga de categorías (pero el producto sí cargó)
   // Si no hay categorías disponibles, también lo mostramos aquí como advertencia.
   if ((categoriesError || categories.length === 0) && product && isEditing) { // Solo advertir en modo edición
        console.log("[ProductDetailPage] Renderizando Advertencia de Categorías...");
       return ( /* ... (Código de advertencia de categorías - puedes integrarlo al layout principal si no es un return) ... */
         <div className="container mx-auto py-10 px-4 max-w-4xl">
            <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md mb-4"> {/* Añadir mb-4 para separar del contenido */}
                <p className="font-semibold text-lg mb-2">Advertencia: {!categoriesError ? 'No hay categorías disponibles.' : 'Error al cargar categorías:'}</p>
                {categoriesError && <p>{categoriesError}</p>}
                 {categories.length === 0 && !categoriesError && <p>No se encontraron categorías en el backend.</p>}
                <p className="mt-2 text-sm text-gray-600">No podrás editar la categoría hasta que esto se solucione.</p>
                 {/* <button onClick={fetchCategoriesData} className="mt-4 text-blue-600 hover:underline">Reintentar</button> */}
           </div>
            {/* Aquí podrías decidir si retornar solo la advertencia o renderizar el resto de la página debajo */}
            {/* Por ahora, el código continúa y renderiza el formulario abajo */}
        </div>
       );
   }


  // Si llegamos aquí, el producto cargó y las categorías cargaron (o no hay ninguna).
  console.log(`[ProductDetailPage] Renderizando ${isEditing ? 'Formulario de Edición' : 'Vista de Detalle'}.`);


  // --- Renderiza la interfaz principal ---
  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">

        {/* Botón para volver a la lista del menú */}
        <Link href={`/dashboard/restaurantes/${restauranteSlug}/menu`} className="text-blue-600 hover:underline mb-6 inline-block text-lg">
            ← Volver al Menú
        </Link>

      {/* Título de la página */}
      <h1 className="text-3xl font-bold text-gray-800 mb-8">
         {isEditing ? 'Editar Producto:' : 'Detalle del Producto:'} {product?.nombre} {/* Muestra título dinámico */}
      </h1>

      {/* Sección de Botón Eliminar */}
       {/* Muestra el botón eliminar siempre o solo en modo viendo */}
      {!isEditing && ( // Muestra solo en modo viendo
           <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-8 flex justify-between items-center">
               <h2 className="text-xl font-semibold text-gray-800">Eliminar Producto</h2>
                {/* Mensaje de error de eliminación */}
                {deleteError && (
                     <div className="bg-red-100 text-red-700 p-3 rounded-md mr-4">
                         {deleteError}
                     </div>
                 )}
                {/* Botón de eliminación */}
               <button
                   onClick={handleDelete}
                   disabled={deleting || updating || loadingProduct || loadingCategories}
                   className="px-4 py-2 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
               >
                   {deleting ? 'Eliminando...' : 'Eliminar Producto'}
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
                       onClick={() => setIsEditing(true)} // Cambia a modo edición al hacer clic
                       disabled={loadingCategories || categoriesError} // Deshabilitar si categorías no cargaron bien (necesario para el form)
                       className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Editar Producto
                   </button>
               </div>

               {/* Mostrar los detalles del producto */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4"> {/* Grid para detalles */}
                   {/* Imagen del producto */}
                    {product.imagen && (
                         <div className="md:col-span-2 mb-4"> {/* Ocupa 2 columnas */}
                              <p className="block text-sm font-medium text-gray-700 mb-1">Imagen:</p>
                               <div className="relative w-40 h-40 overflow-hidden rounded-md border border-gray-200">
                                    <Image
                                        src={`${process.env.NEXT_PUBLIC_API_URL}${product.imagen}`}
                                        alt={`Imagen de ${product.nombre}`}
                                        fill
                                        style={{ objectFit: 'cover' }}
                                        className="object-cover"
                                         sizes="160px" // Tamaño fijo
                                    />
                               </div>
                         </div>
                    )}
                    {/* Nombre */}
                   <p><span className="font-semibold text-gray-700">Nombre:</span> {product.nombre}</p>
                   {/* Precio */}
                    <p><span className="font-semibold text-gray-700">Precio:</span> {product.precio ? parseFloat(product.precio).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' }) : 'N/A'}</p>
                    {/* Categoría */}
                    <p><span className="font-semibold text-gray-700">Categoría:</span> {product.categoria_details?.nombre || 'N/A'}</p> {/* Muestra nombre de categoría anidada */}
                    {/* Slug */}
                    <p><span className="font-semibold text-gray-700">Slug:</span> {product.slug || 'N/A'}</p>
                     {/* Descripción */}
                     {product.descripcion && (
                         <div className="md:col-span-2"> {/* Ocupa 2 columnas */}
                              <p><span className="font-semibold text-gray-700">Descripción:</span> {product.descripcion}</p>
                         </div>
                     )}
                    {/* Disponibilidad */}
                     <p><span className="font-semibold text-gray-700">Disponibilidad:</span> <span className="capitalize">{product.disponibilidad?.replace('_', ' ') || 'N/A'}</span></p>
                     {/* Activo */}
                     <p><span className="font-semibold text-gray-700">Activo:</span> {product.activo ? 'Sí' : 'No'}</p>
                     {/* Destacado */}
                     <p><span className="font-semibold text-gray-700">Destacado:</span> {product.destacado ? 'Sí' : 'No'}</p>
                     {/* Orden */}
                     <p><span className="font-semibold text-gray-700">Orden:</span> {product.orden != null ? product.orden : 'N/A'}</p>
                      {/* Fechas */}
                     <p><span className="font-semibold text-gray-700">Creado:</span> {product.created_at ? new Date(product.created_at).toLocaleString() : 'N/A'}</p>
                     <p><span className="font-semibold text-gray-700">Actualizado:</span> {product.updated_at ? new Date(product.updated_at).toLocaleString() : 'N/A'}</p>
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
                            // Opcional: Resetear formData a los datos originales del 'product' si el usuario cancela
                            if(product) {
                                setFormData({
                                    nombre: product.nombre || "",
                                    descripcion: product.descripcion || "",
                                    precio: product.precio != null ? String(product.precio) : "",
                                    categoria: product.categoria || "",
                                    imagen: null, // Resetea el input file
                                    activo: product.activo ?? true,
                                    disponibilidad: product.disponibilidad || "disponible",
                                    orden: product.orden != null ? product.orden : 0,
                                    destacado: product.destacado ?? false,
                                });
                            }
                            setUpdateError(null); // Limpia errores de actualización al cancelar
                            setUpdateSuccess(null); // Limpia éxito al cancelar
                       }}
                        disabled={updating} // Deshabilitar si está guardando
                       className="px-4 py-2 border border-gray-300 text-gray-700 font-semibold rounded-lg shadow-sm hover:bg-gray-100 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                       Cancelar
                   </button>
                  <button
                    type="submit" // type="submit" para enviar el formulario
                    disabled={updating || loadingCategories} // Deshabilitado si actualizando o cargando categorías
                    className="px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {updating ? 'Guardando Cambios...' : 'Guardar Cambios'}
                  </button>
               </div>


             {/* --- Campos del Formulario (copiados de la página de creación, enlazados a formData) --- */}
              {/* Campo: Nombre del Producto */}
              <div className="mb-4">
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">Nombre <span className="text-red-500">*</span></label>
                  <input type="text" id="nombre" name="nombre" value={formData.nombre} onChange={handleInputChange} required className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              {/* Campo: Descripción */}
              <div className="mb-4">
                  <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
                  <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleInputChange} rows="3" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm"></textarea>
              </div>
              {/* Campo: Precio */}
              <div className="mb-4">
                   <label htmlFor="precio" className="block text-sm font-medium text-gray-700 mb-1">Precio <span className="text-red-500">*</span></label>
                   <input type="number" id="precio" name="precio" value={formData.precio} onChange={handleInputChange} required step="0.01" min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm" />
              </div>
              {/* Campo: Categoría (Dropdown) */}
              <div className="mb-4">
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">Categoría <span className="text-red-500">*</span></label>
                  {categories.length === 0 && !loadingCategories ? (
                       <p className="text-sm text-gray-600 mt-1">No hay categorías disponibles para seleccionar.</p>
                  ) : (
                       <select id="categoria" name="categoria" value={formData.categoria} onChange={handleInputChange} required disabled={loadingCategories || categories.length === 0} className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm">
                           <option value="">-- Seleccionar Categoría --</option>
                           {categories.map(category => (
                               <option key={category.id} value={category.id}>{category.nombre}</option>
                           ))}
                      </select>
                  )}
                  {categoriesError && <p className="mt-1 text-sm text-red-600">{categoriesError} (No podrás editar la categoría)</p>}
              </div>
              {/* Campo: Imagen (File Input y previsualización/info de imagen existente) */}
               <div className="mb-4">
                   <label htmlFor="imagen" className="block text-sm font-medium text-gray-700 mb-1">Imagen</label>
                    {/* Mostrar imagen actual si existe y no se ha seleccionado una nueva */}
                    {product?.imagen && !(formData.imagen instanceof File) && (
                         <div className="mb-2">
                             <p className="text-sm text-gray-600 mb-1">Imagen actual:</p>
                              <div className="relative w-32 h-32 overflow-hidden rounded-md border border-gray-200">
                                   <Image src={product.imagen} alt={`Imagen actual de ${product.nombre}`} fill style={{ objectFit: 'cover' }} className="object-cover" sizes="128px" />
                              </div>
                         </div>
                    )}
                    {/* Input para seleccionar nueva imagen */}
                   <input type="file" id="imagen" name="imagen" onChange={handleInputChange} accept="image/*" className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100" />
                    {/* Mostrar nombre del nuevo archivo seleccionado */}
                     {formData.imagen instanceof File && (
                         <p className="mt-2 text-sm text-gray-500">Nuevo archivo seleccionado: {formData.imagen.name}</p>
                     )}
               </div>
               {/* Campo: Disponibilidad (Radio Buttons) */}
                <div className="mb-4">
                    <span className="block text-sm font-medium text-gray-700 mb-1">Disponibilidad</span>
                    <div className="mt-1 flex gap-4">
                        <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-primary focus:ring-primary" name="disponibilidad" value="disponible" checked={formData.disponibilidad === 'disponible'} onChange={handleInputChange} />
                            <span className="ml-2 text-gray-700">Disponible</span>
                        </label>
                         <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-primary focus:ring-primary" name="disponibilidad" value="agotado" checked={formData.disponibilidad === 'agotado'} onChange={handleInputChange} />
                            <span className="ml-2 text-gray-700">Agotado</span>
                        </label>
                         <label className="inline-flex items-center">
                            <input type="radio" className="form-radio text-primary focus:ring-primary" name="disponibilidad" value="proximamente" checked={formData.disponibilidad === 'proximamente'} onChange={handleInputChange} />
                            <span className="ml-2 text-gray-700">Próximamente</span>
                        </label>
                    </div>
                </div>
              {/* Campo: Activo (Checkbox) */}
               <div className="mb-4">
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="form-checkbox text-primary focus:ring-primary rounded" name="activo" checked={formData.activo} onChange={handleInputChange} />
                        <span className="ml-2 text-sm font-medium text-gray-700">Activo (Visible en el menú)</span>
                    </label>
               </div>
               {/* Campo: Destacado (Checkbox) */}
               <div className="mb-6">
                    <label className="inline-flex items-center">
                        <input type="checkbox" className="form-checkbox text-primary focus:ring-primary rounded" name="destacado" checked={formData.destacado} onChange={handleInputChange} />
                        <span className="ml-2 text-sm font-medium text-gray-700">Destacado (Mostrar en portada)</span>
                    </label>
               </div>
              {/* Campo: Orden (Opcional) */}
              <div className="mb-6">
                  <label htmlFor="orden" className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
                  <input type="number" id="orden" name="orden" value={formData.orden} onChange={handleInputChange} min="0" className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-primary focus:border-primary sm:text-sm" />
              </div>

              {/* Botón de Envío del Formulario (se movió arriba junto a Cancelar) */}

          </form>

      )} {/* --- Fin de la renderización condicional --- */}

    </div>
  );
}