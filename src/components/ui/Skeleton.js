export default function Skeleton() {
  return (
    <div className="min-h-screen bg-white animate-pulse">
      {/* Hero Section */}
      <div className="relative h-96 w-full bg-gray-200"></div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
        <div className="h-6 bg-gray-200 rounded w-3/4 mx-auto"></div>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
          <div className="h-24 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-1/2 mx-auto mt-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
          <div className="h-48 bg-gray-200 rounded"></div>
        </div>
      </div>
    </div>
  );
} 