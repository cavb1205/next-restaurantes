import Image from "next/image";
import Skeleton from "@/components/ui/Skeleton";

import { getNegocio } from "../../services/negocio";
import { getCategorias } from "../../services/productos";
import ProductoList from "@/components/productos/ProductoList";
import { Suspense } from "react";
import WhatsApp from "@/components/WhatsApp";
import { SocialIcon } from "@/components/icons/SocialIcon";
import InfoCard from "@/components/negocios/InfoCard";
import { ClockIcon, MapPinIcon, TruckIcon } from "@heroicons/react/24/outline";
import Reviews from "@/components/negocios/Reviews";
import CategoriaFilter from "@/components/productos/CategoriaFilter";
import { useCart } from "@/context/CartContext";
export default async function RestauranteDetalle({ params, searchParams }) {
  const { slug } = params;
  const categoria = searchParams.categoria || "todas";
  console.log("categoria en restaurante detalle", categoria);

  let negocio = await getNegocio(slug);
  console.log(negocio);
  if (negocio.error) {
    return <div>No se encontró el restaurante</div>;
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative h-96 w-full">
        <Image
          src={`${process.env.API_URL}/${negocio?.logo}`}
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
            {negocio.tipos_cocina.length > 0 ? (
              <div className="text-xs md:text-md opacity-90 capitalize flex flex-row flex-wrap items-center gap-2 justify-center font-semibold">
                {negocio.tipos_cocina.map((tipo) => (
                  <span
                    key={tipo.id}
                    className="bg-primary/70 px-2 py-1 rounded-full gap-2"
                  >
                    {tipo.nombre}{" "}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-lg md:text-xl opacity-90 capitalize">
                Restaurante
              </span>
            )}
          </div>

          {negocio.estado === "abierto" ? (
            <span className="bg-green-500 text-white font-semibold px-4 py-1 text-sm rounded-full absolute top-4 right-4">
              Abierto
            </span>
          ) : (
            <span className="bg-red-500 text-white font-semibold px-2 py-1 text-sm rounded-full absolute top-4 right-4">
              Cerrado
            </span>
          )}
          {negocio.redes_sociales.length > 0 ? (
            <div className="flex gap-2 animate-fade-in">
              {negocio.redes_sociales.map((red) => (
                <SocialIcon
                  key={red.id}
                  href={red.url}
                  platform={red.tipo}
                  label={red.nombre}
                  className="bg-[#E1306C] hover:bg-[#D81B60]"
                />
              ))}
              )
            </div>
          ) : null}
        </div>
      </div>

      {/* Contenido Principal */}
      <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col gap-4">
        <p className="text-center text-secondary text-sm md:text-base">
          {negocio.descripcion}
        </p>
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <InfoCard
              icon={<ClockIcon className="h-6 w-6 text-primary" />}
              title="Horarios"
              content={
                `Apertura ${negocio.hora_apertura} - Cierre ${negocio.hora_cierre}` ||
                "No especificado"
              }
            />
            <InfoCard
              icon={<MapPinIcon className="h-6 w-6 text-primary capitalize" />}
              title="Ubicación"
              content={negocio.direccion || "No especificado"}
            />

            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <TruckIcon className="h-6 w-6 text-primary" />
                <h3 className="hidden md:block text-lg font-semibold text-primary">
                  Envíos
                </h3>
              </div>

              {negocio.envios?.length > 0 ? (
                negocio.envios
                  ?.filter((envio) => envio.estado === "activo")
                  .map((envio) => (
                    <div key={envio.id} className="flex flex-row gap-1 w-full">
                      <span className="text-xs md:text-sm text-secondary">
                        {envio.nombre}
                      </span>
                      <span className="text-xs md:text-sm text-primary font-semibold text-right">
                        {envio.precio == 0 || ""
                          ? "Gratuito"
                          : envio.precio.toLocaleString("es-CL", {
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
        
        <Suspense fallback={<Skeleton />}>
          <ProductoList negocioId={negocio.slug} categoria={categoria} />
        </Suspense>
      </div>
      <WhatsApp negocio={negocio} />
      <Reviews
        negocioId={negocio.id}
        reviews={[
          {
            id: 1,
            rating: 5,
            comment: "Excelente servicio",
            date: "2024-01-01",
          },
          {
            id: 2,
            rating: 4,
            comment: "Buen servicio",
            date: "2024-01-02",
          },
          {
            id: 3,
            rating: 3,
            comment: "Buen servicio",
            date: "2024-01-03",
          },
        ]}
      />
    </div>
  );
}
