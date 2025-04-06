import Image from "next/image";

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
export default async function RestauranteDetalle({ params }) {
  const { slug } = params;

  let negocio = await getNegocio(slug);
  console.log(negocio);
  if (negocio.error) {
    return <div>No se encontró el restaurante</div>;
  }
  negocio = negocio[0];
  let categorias = await getCategorias(negocio.id);
  console.log(categorias);

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
            <span className="bg-green-500 text-white font-semibold px-4 py-1 text-sm rounded-full absolute top-4 right-4">
              Abierto
            </span>
          ) : (
            <span className="bg-red-500 text-white font-semibold px-2 py-1 text-sm rounded-full absolute top-4 right-4">
              Cerrado
            </span>
          )}
          {negocio.facebook || negocio.instagram || negocio.tiktok ? (
            <div className="flex gap-2 animate-fade-in">
              {negocio.facebook && (
                <SocialIcon
                  href={negocio.facebook}
                  platform="facebook"
                  label="Facebook"
                  className="bg-[#1877F2] hover:bg-[#166FE5]"
                />
              )}
              {negocio.instagram && (
                <SocialIcon
                  href={negocio.instagram}
                  platform="instagram"
                  label="Instagram"
                  className="bg-gradient-to-br from-[#833AB4] via-[#FD1D1D] to-[#FCB045] hover:opacity-90"
                />
              )}
              {negocio.tiktok && (
                <SocialIcon
                  href={negocio.tiktok}
                  platform="tiktok"
                  label="TikTok"
                  className="bg-gray-900 hover:bg-gray-800"
                />
              )}
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
              content={negocio.horarios || "No especificado"}
            />
            <InfoCard
              icon={<MapPinIcon className="h-6 w-6 text-primary" />}
              title="Ubicación"
              content={negocio.ubicacion || "No especificado"}
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
                  ?.filter((envio) => envio.estado)
                  .map((envio) => (
                    <div key={envio.id} className="flex flex-row gap-1 w-full">
                      <span className="text-xs md:text-sm text-secondary">
                        {envio.nombre}
                      </span>
                      <span className="text-xs md:text-sm text-primary font-semibold text-right">
                        {envio.precio === 0 || ""
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
        <CategoriaFilter
          categorias={categorias}
        />
        <Suspense fallback={<div>Cargando productos...</div>}>
          <ProductoList negocioId={negocio.id} />
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
