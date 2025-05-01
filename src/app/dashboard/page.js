// app/dashboard/page.js
// app/dashboard/page.js
"use client"; // Este es un Componente de Cliente

import { useState, useEffect } from "react";
import Link from "next/link";
// Importar las funciones de servicio API necesarias
import {
  getMyRestaurants,
  getRestaurantDashboardSummary,
} from "@/app/services/apiService"; // Asegúrate de que la ruta sea correcta

export default function DashboardPage() {
  // loadingData cubrirá todo el proceso inicial: obtener restaurantes Y luego obtener el resumen.
  // Comienza como true, ya que la carga inicial empieza inmediatamente en el Efecto 1.
  const [loadingData, setLoadingData] = useState(true); // <-- Comienza como true para la carga inicial combinada
  const [error, setError] = useState(null); // Estado para errores durante la obtención de datos
  const [restaurants, setRestaurants] = useState([]); // Lista de restaurantes del usuario
  // selectedRestaurantSlug debería ser seteado por el Efecto 1 después de obtener los restaurantes, o por el selector (dropdown) más tarde.
  const [selectedRestaurantSlug, setSelectedRestaurantSlug] = useState(null);
  // summaryData contendrá el resumen del panel para el restaurante seleccionado.
  // Es útil almacenar el slug con los datos del resumen para comparación en los Efectos.
  const [summaryData, setSummaryData] = useState(null); // Contendrá { ...resumen, restaurant_slug: selectedSlug }

  // Opcional: Añadir un log en cada renderizado del componente para ver los cambios de estado
  console.log("--- DashboardPage Render ---");
  console.log("Estado Actual:", { selectedSlug: selectedRestaurantSlug, loadingData, error, restaurantsCount: restaurants.length, hasSummary: !!summaryData, summarySlug: summaryData?.restaurant_slug });
  console.log("--------------------------");


  // --- Efecto 1: Obtención Inicial de Datos (Restaurantes y luego Resumen) ---
  // Este efecto se ejecuta SÓLO UNA VEZ cuando el componente se monta gracias al array de dependencias vacío [].
  // Maneja toda la secuencia de carga inicial para los restaurantes y el resumen por defecto.
  useEffect(() => {
    console.log("--- Efecto 1 (Carga Inicial) Disparado ---"); // <-- Log al inicio del efecto

    // Definir la función asíncrona principal para obtener todos los datos iniciales necesarios
    const fetchData = async () => {
      console.log("fetchData: Iniciando obtención inicial de datos...");
      try {
        setLoadingData(true); // Asegura que el estado de carga sea true al inicio del proceso combinado
        setError(null); // Limpia cualquier error previo

        // --- Paso 1: Obtener Restaurantes ---
        console.log("fetchData: Llamando a getMyRestaurants()...");
        // Esta llamada API debería devolver una lista de restaurantes que el usuario autenticado administra.
        const myRestaurants = await getMyRestaurants();
        console.log("fetchData: getMyRestaurants() retornó:", myRestaurants);

        // Verificar si se obtuvieron restaurantes y si la lista no está vacía
        if (!myRestaurants || myRestaurants.length === 0) {
          console.log("fetchData: No se encontraron restaurantes o la lista está vacía para este usuario.");
          // Setea un mensaje de error informativo para el usuario.
          setError("Tu cuenta de usuario no está asociada a ningún restaurante. Por favor, contacta al administrador para que te asigne uno.");
          // Limpia los estados relevantes y desactiva la carga.
          setRestaurants([]);
          setSelectedRestaurantSlug(null);
          setSummaryData(null);
           setLoadingData(false); // <-- Desactiva la carga si no se encuentran restaurantes
          return; // Detiene el proceso aquí, ya que no podemos continuar sin restaurantes.
        }

        // Si se encontraron restaurantes:
        console.log("fetchData: Restaurantes encontrados. Seteando estado y procediendo a obtener resumen.");
        // Actualiza el estado de restaurantes con los datos recibidos.
        setRestaurants(myRestaurants);
        // Selecciona el slug del primer restaurante de la lista como el predeterminado.
        const firstRestaurantSlug = myRestaurants[0].slug; // Asumiendo que el objeto restaurante tiene una propiedad 'slug'.
        // Actualiza el estado selectedRestaurantSlug. Esto disparará el Efecto 2 inmediatamente después de que React procese esta actualización de estado.
        setSelectedRestaurantSlug(firstRestaurantSlug); // <-- Esto setea el estado

        // --- Paso 2: Obtener Resumen para el primer restaurante ---
        // Llama a la función auxiliar asíncrona para obtener el resumen para el slug del *primer* restaurante.
        // Usamos 'await' aquí para asegurar que la obtención del resumen se complete antes de que fetchData termine.
        console.log(`WorkspaceData: Llamando a fetchSummaryAsync para el slug: ${firstRestaurantSlug}...`);
        // Pasa el slug directamente a la función auxiliar para asegurar que usa el valor correcto.
        await fetchSummaryAsync(firstRestaurantSlug); // <-- **¡Aquí se llama a la función que hace la 2ª API!**

      } catch (err) {
        // Este bloque catch maneja errores tanto de getMyRestaurants como de getRestaurantDashboardSummary (si se llamó).
        console.error('fetchData: Error durante la obtención inicial de datos:', err);
        // Setea un mensaje de error general para el usuario.
        setError('Error al cargar los datos del panel.');
        // Asegura que el estado de carga se desactive en caso de un error.
        setLoadingData(false); // <-- Asegura que la carga se desactive en caso de error en fetchData
      } finally {
         // El bloque finally en fetchSummaryAsync maneja la desactivación de loadingData(false) después de la obtención del resumen.
         // Si el error ocurrió antes de llamar a fetchSummaryAsync, loadingData(false) se maneja en el bloque catch de arriba.
         // Este bloque finally es menos crítico ahora que loadingData se maneja en ramas específicas.
          console.log("fetchData: Finalizado try/catch del intento de obtención inicial de datos.");
      }
       console.log("fetchData: Fin de la función asíncrona fetchData.");
    };

    // Llama a la función principal fetchData SÓLO UNA VEZ cuando este componente se monta.
    // El array de dependencias vacío [] hace que esto se comporte como componentDidMount.
    fetchData();

    // Dependencias: Array vacío [] significa que este efecto se ejecuta solo una vez al montar.
    // Las actualizaciones de estado (setRestaurants, setSelectedRestaurantSlug, setSummaryData, setLoadingData, setError)
    // dentro de la función asíncrona NO harán que este efecto específico se vuelva a ejecutar.
  }, []); // <-- Array de dependencias vacío


   // --- Función Auxiliar Asíncrona para Obtener Resumen ---
   // Esta función realiza la llamada API real para obtener el resumen del panel.
   // Es llamada por el Efecto 1 (para la carga inicial) y el Efecto 2 (para cambios de selección).
  const fetchSummaryAsync = async (slug) => {
       console.log(`WorkspaceSummaryAsync: Iniciando para el slug ${slug}...`);
       // Añade una verificación en caso de que se dispare una obtención con un slug null (no debería ocurrir con la lógica actual, pero es seguro)
       if (!slug) {
           console.error("fetchSummaryAsync: Llamada con slug null o undefined!");
           // Opcionalmente setea un error o maneja este caso
           // setError("Error interno: Slug de restaurante no disponible.");
           // setLoadingData(false);
           return;
       }

       try {
           // Setea loading a true *antes* de que la llamada API comience para esta operación específica de obtención.
           // Podría ya estar true por la carga inicial, pero setearlo asegura que se mantenga true.
           setLoadingData(true); // <-- Inicia la carga para ESTA obtención de resumen
           setError(null); // Limpia errores previos antes de una nueva obtención

           console.log(`WorkspaceSummaryAsync: Llamando a getRestaurantDashboardSummary(${slug})...`);
           // **<-- ¡Esta es la línea que hace la petición GET /api/restaurantes/{slug}/dashboard/summary/!**
           const summary = await getRestaurantDashboardSummary(slug); // <-- Llamada API 2

           console.log("fetchSummaryAsync: getRestaurantDashboardSummary() retornó:", summary);
           // Actualiza el estado summaryData con los datos recibidos.
           // Almacena el slug con los datos para verificar fácilmente si el resumen coincide con el slug seleccionado.
           setSummaryData({...summary, restaurant_slug: slug});

       } catch (err) {
           // Este bloque catch maneja errores específicos al obtener el resumen.
           console.error('fetchSummaryAsync: Error al obtener el resumen del panel:', err);
           // Setea un mensaje de error específico relacionado con el resumen.
           setError('Error al cargar el resumen para el restaurante seleccionado.');
       } finally {
           // --- CRUCIAL: Desactiva siempre el estado de carga cuando esta operación de obtención termina (éxito o error) ---
           console.log("fetchSummaryAsync: Finalizado. Seteando loadingData(false).");
           setLoadingData(false); // <-- Asegura que la carga esté desactivada cuando la obtención termine
       }
        console.log("fetchSummaryAsync: Fin de la función fetchSummaryAsync.");
  };


  // --- Efecto 2: Manejar Cambio de Selección de Restaurante ---
  // Este efecto se ejecuta cuando el estado `selectedRestaurantSlug` cambia.
  // Esto sucede inicialmente cuando el Efecto 1 lo setea, y posteriormente si el usuario usa un selector (dropdown).
  useEffect(() => {
    console.log("--- Efecto 2 (Manejo de Cambio de Selección) Disparado ---"); // <-- Log al inicio del efecto
    console.log("Estado al inicio del Efecto 2:", { selectedSlug: selectedRestaurantSlug, hasSummary: !!summaryData, summarySlug: summaryData?.restaurant_slug, loadingData, error }); // <-- Log estado aquí

    // Si no hay un slug seleccionado, no hay resumen para obtener. Limpia los datos del resumen.
    if (!selectedRestaurantSlug) {
        console.log("Efecto 2: selectedSlug es null. Limpiando datos de resumen si existen.");
        setSummaryData(null);
         // Si loadingData es true y error es null aquí, implica que la obtención inicial falló antes de setear el slug
         // o el Efecto 1 terminó y no encontró restaurantes, pero loadingData no se desactivó correctamente (manejado en Efecto 1 ahora).
         // Si loadingData es true aquí, implica una obtención en curso. Deberíamos desactivarla solo si no se espera ninguna obtención.
         // Aseguremos que la carga esté desactivada si Efecto 1 no pudo setear un slug.
         if (loadingData && !error) { // Si loading es true, pero no hay slug y no hay error...
             console.log("Efecto 2: selectedSlug null, loadingData true, no error. Asumiendo que la obtención inicial falló antes de setear slug o no encontró restaurantes. Seteando loadingData(false).");
             setLoadingData(false); // Asegura que la carga esté desactivada en este estado inesperado.
         }
        return; // No procede a obtener si no hay slug seleccionado.
    }

    // Si se selecciona un slug, verifica si necesitamos obtener o re-obtener el resumen.
    // Necesitamos obtener si summaryData es null O si el slug en summaryData no coincide con el slug seleccionado.
    const needsFetch = !summaryData || summaryData.restaurant_slug !== selectedRestaurantSlug;

    // --- Condición para Disparar la Obtención de Resumen en Cambio de Selección ---
    // Obtiene si se necesita un resumen para el slug seleccionado actualmente Y
    // NO estamos actualmente cargando datos.
    // La verificación `!loadingData` aquí evita iniciar una *nueva* obtención si ya hay una en curso
    // (ya sea la obtención inicial combinada del Efecto 1, o una obtención previa por cambio de selección).
    // Esto es crucial para evitar condiciones de carrera y múltiples llamadas API para los mismos datos.
    // También aseguramos que no haya un estado de error.
     if (needsFetch && !loadingData && !error) {
         console.log(`Efecto 2: Condiciones cumplidas. Necesidad de obtener resumen para ${selectedRestaurantSlug}. Llamando a fetchSummaryAsync().`);
         // Llama a la función auxiliar asíncrona para realizar la obtención.
         // fetchSummaryAsync se encargará de setear loadingData(true) al inicio.
         fetchSummaryAsync(selectedRestaurantSlug);

     } else {
         // Este bloque else se ejecuta si las condiciones para iniciar una NUEVA obtención NO se cumplen.
         console.log("Efecto 2: Condiciones NO cumplidas para obtener resumen inmediato.", { selectedSlug: selectedRestaurantSlug, hasSummary: !!summaryData, summarySlug: summaryData?.restaurant_slug, loadingData, error });
          // Si el Efecto 2 se ejecuta pero NO dispara una obtención (significa que el `if` es false),
          // necesitamos asegurar que loadingData refleje correctamente el estado.
          // Si loadingData es true aquí, implica que una obtención *fue* iniciada (inicial o previa por selección) pero no ha terminado.
          // Si loadingData es false aquí, y needsFetch es true, significa que se necesita resumen pero las condiciones no se cumplieron (probablemente !loadingData fue false en un ciclo de render previo). Este estado no debería persistir si la lógica es correcta.
          // Si loadingData es false aquí, y needsFetch es false, significa que el resumen está cargado, el estado es correcto.
           if (loadingData && !error) {
                console.log("Efecto 2: No obteniendo, pero loadingData es true y no hay error. Asumiendo una obtención en curso iniciada en otro lugar. Esperando.");
                // En este caso, dejamos loadingData como true, confiando en que el bloque finally de la obtención en curso lo pondrá a false.
           } else if (!loadingData && !needsFetch && !error) {
                console.log("Efecto 2: Datos de resumen cargados para el slug seleccionado, no cargando, no hay error. El estado es correcto.");
                // Este es el estado estable deseado cuando el panel se muestra. Asegura que la carga esté desactivada.
                 setLoadingData(false); // Redundante pero seguro
           } else if (!loadingData && needsFetch && !error) {
               // Este estado (se necesita resumen, no cargando, no hay error, pero la obtención no se disparó) no debería ocurrir si la lógica es correcta.
               // Podría indicar un error sutil en el manejo de estados o dependencias.
                console.warn("Efecto 2: Posible Problema de Estado - Se necesita resumen, no cargando, no hay error, pero la obtención no se disparó.");
                // Intenta disparar la obtención como un fallback, pero esto podría indicar un defecto de lógica.
                 // fetchSummaryAsync(selectedRestaurantSlug); // Descomenta esto para un fallback agresivo si es necesario
           }
     }


  }, [selectedRestaurantSlug, summaryData, loadingData, error]); // Dependencias: Se disparan por cambios en selectedRestaurantSlug, summaryData, loadingData, error.


  // --- Lógica de Renderizado ---

  // Mostrar estado de carga. loadingData es true si fetchData o fetchSummaryAsync está ejecutándose.
  // Es false cuando el proceso termina o ocurre un error.
  // Muestra esto si loadingData es true y no hay error seteado.
  if (loadingData && !error) {
       console.log("Renderizado: Pantalla de Carga de Datos. loadingData:", loadingData);
       return (
         <div className="flex items-center justify-center min-h-screen bg-gray-100">
           <div className="text-center">
             <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-primary mx-auto mb-4"></div>
             {/* Ajusta el mensaje según lo que probablemente se está cargando */}
             {/* Si los restaurantes aún no se han cargado, muestra carga general. Si los restaurantes están cargados pero el resumen no, muestra carga de resumen. */}
             {restaurants.length === 0 && !selectedRestaurantSlug ? ( // Antes de que se carguen los restaurantes y se setee el slug
                 <p className="text-gray-700 text-lg">Cargando panel de control...</p>
             ) : ( // Después de cargar restaurantes y setear slug, implica que el resumen se está cargando
                 <p className="text-gray-700 text-lg">Cargando resumen del panel...</p>
             )}
           </div>
         </div>
       );
  }

  // Mostrar mensaje si el usuario está autenticado pero no tiene restaurantes asociados
  // Este estado ocurre si loadingData es false (la obtención terminó) Y la lista de restaurantes está vacía Y no hay error.
  // Esta verificación debe ocurrir *después* de la verificación de carga general.
  if (!loadingData && restaurants.length === 0 && !error) {
       console.log("Renderizado: No se Encontraron Restaurantes. loadingData:", loadingData);
       return (
           <div className="container mx-auto py-10 px-4 max-w-4xl">
               <div className="bg-yellow-100 text-yellow-700 p-6 rounded-lg shadow-md">
                   <p className="font-semibold text-lg mb-2">Información:</p>
                   <p>Tu cuenta de usuario no está asociada a ningún restaurante. Por favor, contacta al administrador para que te asigne uno.</p>
               </div>
           </div>
       );
  }

  // Mostrar estado de error
  // Esta verificación debe ocurrir *después* de la verificación de carga general.
  if (error) {
       console.log("Renderizado: Pantalla de Error. error:", error);
    return (
      <div className="container mx-auto py-10 px-4 max-w-4xl">
         <div className="bg-red-100 text-red-700 p-6 rounded-lg shadow-md">
             <p className="font-semibold text-lg mb-2">Error:</p>
             <p>{error}</p>
         </div>
      </div>
    );
  }

  // Si llegamos aquí, loadingData es false, no hay error, y restaurants.length > 0.
  // Necesitamos verificar si hemos cargado exitosamente los datos del resumen para el slug seleccionado.
  // Esta es la condición para renderizar el contenido principal del panel.
  if (!summaryData || summaryData.restaurant_slug !== selectedRestaurantSlug) {
       // Este estado no debería ocurrir idealmente si los estados de error/carga se manejan correctamente
       // y se encontraron restaurantes. Si loadingData es false y no hay error, summaryData
       // DEBERÍA existir y coincidir con el slug seleccionado si la obtención fue exitosa.
       console.warn("Renderizado: Fallback - Faltan Datos del Resumen o No Coinciden (loadingData false, no error). Esto indica un posible problema de estado.");
       return (
            <div className="container mx-auto py-10 px-4 max-w-4xl">
                <div className="bg-gray-100 text-gray-700 p-6 rounded-lg shadow-md">
                    <p>No se pudieron cargar completamente los datos del panel. Intenta recargar la página o verifica tu asignación de restaurante.</p>
               </div>
           </div>
       );
  }


  // --- Contenido Principal del Panel de Control ---
  // Esta sección se renderiza SÓLO cuando loadingData es false, error es null,
  // los restaurantes están cargados, y summaryData para el slug seleccionado está cargado.
  console.log("Renderizado: Contenido Principal del Panel.");
  // Obtiene el nombre del restaurante actual para el título
  const currentRestaurant = restaurants.find(r => r.slug === selectedRestaurantSlug);
  // Usa el nombre si se encuentra, si no, usa el slug (no debería pasar si los restaurantes están cargados).
  const restaurantName = currentRestaurant ? currentRestaurant.nombre : selectedRestaurantSlug;


  return (
    <div className="py-2"> {/* Padding mínimo, el Layout ya proporciona padding general */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Panel de Control - ${restaurantName}`}</h1>

      {/* Opcional: Selector de restaurante si el usuario tiene varios */}
      {/* Se muestra SÓLO si la lista de restaurantes tiene más de un elemento */}
      {restaurants.length > 1 && (
          <div className="mb-8 p-4 bg-white rounded-lg shadow-sm border border-gray-100">
              <label htmlFor="restaurant-select" className="block text-sm font-medium text-gray-700 mb-2">Seleccionar Restaurante:</label>
              <select
                  id="restaurant-select"
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
                  value={selectedRestaurantSlug || ''} // El valor seleccionado es el slug
                  onChange={(e) => setSelectedRestaurantSlug(e.target.value)} // Al cambiar la selección, actualiza el estado selectedRestaurantSlug
              >
                  {/* Mapea sobre la lista de restaurantes para crear las opciones del selector */}
                  {restaurants.map(r => (
                      <option key={r.slug} value={r.slug}>{r.nombre}</option> // El valor de la opción es el slug, el texto mostrado es el nombre del restaurante
                  ))}
              </select>
          </div>
      )}

      {/* Sección de Tarjetas de Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10"> {/* Usa una cuadrícula para organizar las tarjetas */}
        {/* Tarjeta: Órdenes Pendientes */}
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition-transform duration-200 hover:scale-105"> {/* Estilo de tarjeta */}
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Órdenes Pendientes</h2>
           {/* Muestra el conteo, usando encadenamiento opcional ?. y por defecto 0 si es null/undefined */}
          <p className="text-4xl font-extrabold text-primary">{summaryData.ordenes?.pendiente || 0}</p> {/* Número grande y en negrita */}
        </div>

        {/* Tarjeta: Órdenes En Proceso */}
         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition-transform duration-200 hover:scale-105"> {/* Estilo de tarjeta */}
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Órdenes En Proceso</h2>
           {/* Muestra el conteo con un color diferente */}
          <p className="text-4xl font-extrabold text-orange-500">{summaryData.ordenes?.en_proceso || 0}</p>
        </div>

         {/* Tarjeta: Ventas Hoy */}
         <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 transform transition-transform duration-200 hover:scale-105"> {/* Estilo de tarjeta */}
          <h2 className="text-lg font-semibold text-gray-700 mb-3">Ventas Hoy</h2>
          <p className="text-4xl font-extrabold text-green-600">
            {/* Formatea el monto de ventas a moneda chilena (CLP) */}
            {parseFloat(summaryData.ventas?.hoy || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
          </p>
        </div>
         {/* Añade más tarjetas de resumen si es necesario (ej: Órdenes en Camino, Ventas Semana, etc.) */}
      </div>

      {/* Sección: Órdenes Recientes */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200 mb-10"> {/* Estilo de sección */}
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Órdenes Recientes</h2>
         {/* Verifica si la lista de órdenes recientes existe en summaryData y no está vacía */}
        {summaryData.ordenes_recientes && summaryData.ordenes_recientes.length > 0 ? (
          <ul className="divide-y divide-gray-200"> {/* Lista con un divisor gris */}
            {/* Mapea sobre la lista de órdenes recientes */}
            {summaryData.ordenes_recientes.map(orden => (
              // Cada elemento es un enlace a la página de detalle de la orden.
              // Usa orden.id como clave única. 'cursor-pointer' indica que se puede hacer clic.
              <li key={orden.id} className="py-4 flex justify-between items-center hover:bg-gray-50 transition duration-150 px-2 -mx-2 rounded cursor-pointer"> {/* Estilo de elemento de lista */}
                {/* Enlace a la página de detalle de la orden */}
                 {/* Usa Link de next/link. La ruta incluye el slug del restaurante y el ID de la orden */}
                 <Link href={`/dashboard/restaurantes/${selectedRestaurantSlug}/ordenes/${orden.id}`} className="flex justify-between items-center w-full">
                    <div>
                        {/* Muestra ID y fecha/hora */}
                        <p className="text-lg font-semibold text-gray-700">Pedido #{orden.id}</p>
                        <p className="text-sm text-gray-600">
                            {new Date(orden.created_at).toLocaleString()} {/* Formatea fecha y hora */}
                        </p>
                         {/* Muestra nombre del cliente si la orden es anónima */}
                         {orden.usuario === null && orden.cliente_nombre && (
                             <p className="text-sm text-gray-600 mt-1"> Cliente: {orden.cliente_nombre}</p>
                         )}
                    </div>
                    <div className="text-right">
                         {/* Insignia de Estado con colores */}
                         <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                              orden.estado === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                              orden.estado === 'en_proceso' ? 'bg-blue-100 text-blue-800' :
                              orden.estado === 'en_camino' ? 'bg-purple-100 text-purple-800' :
                              orden.estado === 'entregada' ? 'bg-green-100 text-green-800' :
                              orden.estado === 'cancelada' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                           {/* Muestra el estado, reemplazando guiones bajos */}
                           {orden.estado.replace('_', ' ')}
                         </span>
                        {/* Muestra el total formateado */}
                        <p className="text-xl font-bold text-primary mt-1">
                           {parseFloat(orden.total || 0).toLocaleString('es-CL', { style: 'currency', currency: 'CLP' })}
                        </p>
                    </div>
                 </Link>
              </li>
            ))}
          </ul>
        ) : (

          <p className="text-gray-600">No hay órdenes recientes para mostrar.</p>
        )}
      </div>

      {/* Sección de Enlaces a otras áreas de gestión */}
      <div className="bg-white p-6 rounded-lg shadow-md border border-gray-200"> {/* Estilo de sección */}
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Gestionar</h2>
          <div className="flex flex-wrap gap-4"> {/* Flexbox para alinear y espaciar */}
              {/* Usa Link de next/link. */}
              {/* Muestra enlaces solo si selectedRestaurantSlug no es null */}
              {selectedRestaurantSlug && (
                  <>
                      {/* Enlaces a páginas de gestión, incluyendo el slug en la ruta */}
                      <Link
                           href={`/dashboard/restaurantes/${selectedRestaurantSlug}/ordenes`}
                           className="inline-block px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-200" // Estilo de botón
                      >
                           Gestionar Órdenes
                      </Link>
                      <Link
                          href={`/dashboard/restaurantes/${selectedRestaurantSlug}/menu`}
                          className="inline-block px-6 py-3 bg-green-600 text-white font-semibold rounded-lg shadow-md hover:bg-green-700 transition duration-200"
                      >
                          Gestionar Menú
                      </Link>
                       <Link
                          href={`/dashboard/restaurantes/${selectedRestaurantSlug}/metodos-pago`}
                          className="inline-block px-6 py-3 bg-purple-600 text-white font-semibold rounded-lg shadow-md hover:bg-purple-700 transition duration-200"
                      >
                          Gestionar Métodos de Pago
                      </Link>
                       <Link
                          href={`/dashboard/restaurantes/${selectedRestaurantSlug}/envios`}
                          className="inline-block px-6 py-3 bg-orange-600 text-white font-semibold rounded-lg shadow-md hover:bg-orange-700 transition duration-200"
                      >
                          Gestionar Envíos
                      </Link>
                       <Link
                          href={`/dashboard/restaurantes/${selectedRestaurantSlug}/redes-sociales`}
                           className="inline-block px-6 py-3 bg-pink-600 text-white font-semibold rounded-lg shadow-md hover:bg-pink-700 transition duration-200"
                      >
                          Gestionar Redes Sociales
                      </Link>
                       {/* Enlace para editar la información principal del restaurante */}
                        <Link
                            href={`/dashboard/restaurantes/${selectedRestaurantSlug}/editar`}
                            className="inline-block px-6 py-3 bg-gray-600 text-white font-semibold rounded-lg shadow-md hover:bg-gray-700 transition duration-200"
                        >
                            Editar Restaurante
                        </Link>
                       {/* El botón de Cerrar Sesión está en el Layout */}
                  </>
              )}
          </div>
      </div>


    </div>
  );
}