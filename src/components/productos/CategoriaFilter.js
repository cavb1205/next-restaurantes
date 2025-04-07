"use client";

import { useSearchParams, usePathname, useRouter } from "next/navigation";

export default function CategoriaFilter({ categorias }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  // Obtener categoría actual de los query params
  const currentCategoria = searchParams.get("categoria") || "todas";

  const handleCategoriaChange = (categoria) => {
    const newParams = new URLSearchParams(searchParams);

    if (categoria === "todas" || categoria.slug === "todas") {
      newParams.delete("categoria");
    } else {
      newParams.set("categoria", categoria.slug);
    }

    router.push(`${pathname}?${newParams.toString()}`, {
      scroll: false,
      shallow: true,
    });
  };

  // Normalizar categorías incluyendo "todas"
  const categoriasNormalizadas = [
    { slug: "todas", nombre: "Todas" },
    ...categorias,
  ];

  return (
    <div className="w-full mb-8">
      {/* Versión móvil */}
      <div className="sm:hidden overflow-x-auto pb-2">
        <div className="flex space-x-2 min-w-max px-2">
          {categoriasNormalizadas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((categoria) => (
            <button
              key={categoria.slug}
              onClick={() => handleCategoriaChange(categoria)}
              className={`px-4 capitalize py-2 rounded-full text-sm font-medium whitespace-nowrap ${
                currentCategoria === categoria.slug
                  ? "bg-primary text-white"
                  : "bg-gray-100 text-secondary hover:bg-gray-200"
              }`}
              aria-label={`Filtrar por ${categoria.nombre}`}
            >
              {categoria.nombre}
            </button>
          ))}
        </div>
      </div>

      {/* Versión desktop */}
      <div className="hidden sm:grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
        {categoriasNormalizadas.sort((a, b) => a.nombre.localeCompare(b.nombre)).map((categoria) => (
          <button
            key={categoria.slug}
            onClick={() => handleCategoriaChange(categoria)}
            className={`px-4 py-2 capitalize rounded-lg text-sm font-medium ${
              currentCategoria === categoria.slug
                ? "bg-primary text-white"
                : "bg-gray-100 text-secondary hover:bg-gray-200"
            }`}
            aria-label={`Filtrar por ${categoria.nombre}`}
          >
            {categoria.nombre}
          </button>
        ))}
      </div>
    </div>
  );
}
