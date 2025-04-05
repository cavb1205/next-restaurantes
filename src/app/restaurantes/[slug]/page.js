import Image from "next/image";


import { getNegocio } from "../../services/negocio";

import ProductoList from "@/components/productos/ProductoList";
import { Suspense } from "react";
import WhatsApp from "@/components/WhatsApp";
export default async function RestauranteDetalle({ params }) {
  const { slug } = params;

  let negocio = await getNegocio(slug);
  console.log(negocio);
  if (negocio.error) {
    return <div>No se encontró el restaurante</div>;
  }
  negocio = negocio[0];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <Image
          src={`${process.env.NEXT_PUBLIC_API_URL}${negocio?.logo.url}`}
          alt={negocio.nombre}
          fill
          className="object-cover brightness-50 object-center"
          priority
        />

        <div className="absolute inset-0 bg-black/40 flex flex-col gap-4 items-center justify-center">
          <div className="text-center text-white px-4">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 capitalize">
              {negocio.nombre}
            </h1>
            <p className="text-lg md:text-xl opacity-90 capitalize">
              {negocio.categoria || "Restaurante"}
            </p>
          </div>

          {negocio.activa ? (
            <span className="bg-green-500 text-white font-semibold px-4 py-1 text-sm rounded-full block">
              Abierto
            </span>
          ) : (
            <span className="bg-red-500 text-white font-semibold px-2 py-1 text-sm rounded-full block">
              Cerrado
            </span>
          )}
          <div className="flex flex-row gap-2">
            <p className="text-white text-sm md:text-base">Whatsapp</p>
          </div>
        </div>
        
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
        <p className="text-center text-secondary text-sm md:text-base">
          {negocio.descripcion}
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="flex flex-col rounded-lg bg-white shadow-md p-2">
              <h2 className="text-base md:text-lg font-semibold text-primary">
                Horarios
              </h2>
              <p className="text-sm md:text-base text-secondary">
                {negocio.horarios}
              </p>
            </div>
            <div className="flex flex-col rounded-lg bg-white shadow-md p-2">
              <h2 className="text-base md:text-lg font-semibold text-primary">
                Dirección
              </h2>
              <p className="text-sm md:text-base text-secondary">
                {negocio.direccion ? negocio.direccion : "No disponible"}
              </p>
            </div>
            {/* <div className="flex flex-col rounded-lg bg-white shadow-md p-2 items-center justify-center">
              <h2 className="text-base md:text-lg font-semibold text-primary">
                Teléfono
              </h2>
              <p className="text-sm md:text-base text-secondary">
                {negocio.telefono ? negocio.telefono : "No disponible"}
              </p>
            </div> */}
            <div className="flex flex-col rounded-lg bg-white shadow-md p-2 items-start md:items-center  justify-start md:justify-center">
              <h2 className="text-base md:text-lg font-semibold text-primary">
                Envíos
              </h2>

              {negocio.envios?.length > 0 ? (
                negocio.envios
                  ?.filter((envio) => envio.estado)
                  .map((envio) => (
                    <div key={envio.id} className="flex flex-row gap-2">
                      <span className="text-sm md:text-sm text-secondary">
                        {envio.nombre}
                      </span>
                      <span className="text-sm md:text-sm text-primary font-semibold">
                        {envio.precio === 0 || "" ? "Gratuito" : envio.precio.toLocaleString("es-CL", {
                          style: "currency",
                          currency: "CLP",
                        })}
                      </span>
                    </div>
                  ))
              ) : (
                <span className="text-sm md:text-sm text-secondary">
                  No hay envíos disponibles
                </span>
              )}
            </div>
          </div>
        </div>
        <h2 className="text-2xl md:text-3xl font-semibold text-primary mt-8 text-center">
          Productos del restaurante
        </h2>
        <Suspense fallback={<div>Cargando productos...</div>}>
          <ProductoList negocioId={negocio.id} />
        </Suspense>
      </div>
      <WhatsApp negocio={negocio} />
    </div>
  );
}
