import Image from "next/image";
import Link from "next/link";
import { getNegocios } from "../services/negocio";

export default async function Negocios() {
  const negocios = await getNegocios();
  console.log(negocios);

  return (
    <div className="min-h-screen p-8">
      <header className="mb-8">
        <h1 className="text-2xl md:text-4xl text-center font-extrabold text-primary mb-6">
          Restaurantes en Calama
        </h1>
        <p className="text-secondary text-center">
          Descubre los mejores lugares para comer en la ciudad
        </p>
      </header>

      {negocios.length === 0 ? (
        <div className="text-[#333333] text-center p-y-10">
          No hay restaurantes disponibles en este momento.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {negocios.map((negocio) => (
            <Link
              key={negocio.id}
              href={`/restaurantes/${negocio.slug}`}
              className="text-[#b87333] hover:scale-105 transition-all duration-300"
            >
              <div className="border border-gray-200 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow">
                <div className="relative h-48 w-full">
                  <Image
                    src={`${process.env.API_URL}${negocio.logo?.url}`}
                    alt={negocio.nombre}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-4">
                  <h2 className="text-xl font-semibold text-[#b87333] mb-2 capitalize">
                    {negocio.nombre}
                  </h2>
                  <p className="text-secondary mb-2 text-sm md:text-base">
                    {negocio.descripcion}
                  </p>
                  <div>
                    <span className="text-primary text-sm font-semibold px-2 py-1 bg-primary/10 rounded-full">
                      {negocio.categoria}
                    </span>
                  </div>
                  <div className="flex justify-center items-center mt-4 text-primary font-semibold">
                    Ver más
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
