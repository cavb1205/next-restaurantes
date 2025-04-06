import { getProductos } from "@/app/services/productos";
import Image from "next/image";
import SinProductos from "./SinProductos";
import ErrorProductos from "./ErrorProductos";
export default async function ProductoList({ negocioId }) {
  let productos = await getProductos(negocioId);
  console.log(productos);
  if (productos == null) {
    return <ErrorProductos />;
  }
  if (productos.length === 0) {
    return <SinProductos />;
  }
  return (
    <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 p-2 md:p-4">
      {productos.map((producto) => (
        <article
          key={producto.id}
          className="group bg-white rounded-xl shadow-lg hover:shadow-2xl transition-all duration-300 ease-out overflow-hidden ring-1 ring-gray-100/10 hover:ring-primary/20"
        >
          <div className="flex flex-col h-full">
            <div className="relative aspect-square w-full">
              <Image
                src={`${process.env.NEXT_PUBLIC_API_URL}${producto.imagen.url}`}
                alt={`Imagen de ${producto.nombre}`}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                className="object-cover transition-opacity opacity-90 group-hover:opacity-100"
                loading="lazy"
              />
            </div>

            <div className="p-6 flex flex-col flex-1">
              <header className="mb-4">
                <h3 className="text-lg md:text-xl font-bold text-primary capitalize truncate">
                  {producto.nombre}
                </h3>
                {producto.descripcion && (
                  <p className="mt-2 text-gray-600 line-clamp-3 leading-relaxed">
                    {producto.descripcion}
                  </p>
                )}
              </header>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs md:text-sm text-secondary font-semibold capitalize px-2 py-1 rounded-full bg-primary/10">
                  {producto.categoria?.nombre || "Sin categoría"}
                </span>
              </div>

              <div className="mt-auto space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-lg font-extrabold text-primary">
                    {producto.precio.toLocaleString("es-CL", {
                      style: "currency",
                      currency: "CLP",
                    })}
                  </span>
                </div>

                <button
                  className="w-full bg-primary hover:bg-primary/90 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/20"
                  aria-label={`Agregar ${producto.nombre} al carrito`}
                >
                  Agregar
                  <span className="ml-2" aria-hidden="true">
                    +
                  </span>
                </button>
              </div>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
