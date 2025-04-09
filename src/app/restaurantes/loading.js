export default function Loading() {
  return (
    <div className="min-h-screen p-8 animate-pulse">
      {/* Header */}
      <header className="mb-8 space-y-4">
        <div className="h-8 bg-gray-200 rounded-lg w-1/3 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
      </header>

      {/* Grid de negocios */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="border border-gray-200 rounded-lg overflow-hidden shadow-md"
          >
            {/* Imagen */}
            <div className="h-48 w-full bg-gray-200"></div>

            {/* Contenido */}
            <div className="p-4 space-y-4">
              {/* Título y estado */}
              <div className="flex justify-between items-center">
                <div className="h-6 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded-full w-16"></div>
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5"></div>
              </div>

              {/* Categoría */}
              <div className="h-4 bg-gray-200 rounded w-24"></div>

              {/* Botón */}
              <div className="h-8 bg-gray-200 rounded-lg w-32 mx-auto"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
