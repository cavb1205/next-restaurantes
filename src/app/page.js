import Image from "next/image";

export default function Home() {
  return (
    <div className="grid grid-rows-[20px_1fr_20px] items-center justify-items-center min-h-screen p-8 pb-20 gap-16 sm:p-20 font-[family-name:var(--font-geist-sans)] bg-white">
      <main className="flex flex-col gap-[32px] row-start-2 items-center sm:items-start">
        <h1 className="text-4xl font-bold text-[#b87333]">Rico en Calama</h1>
        
        <p className="text-[#333333] text-lg text-center sm:text-left">
          Descubre los mejores restaurantes de la ciudad.
        </p>

        <div className="flex gap-4 items-center flex-col sm:flex-row">
          <a
            className="rounded-full border border-solid border-transparent transition-colors flex items-center justify-center bg-[#b87333] text-white gap-2 hover:bg-[#a66323] font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 sm:w-auto"
            href="/restaurantes"
          >
            Ver restaurantes
          </a>
          <a
            className="rounded-full border border-solid border-[#333333]/[.08] transition-colors flex items-center justify-center hover:bg-[#f2f2f2] text-[#333333] hover:border-transparent font-medium text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 w-full sm:w-auto"
            href="#"
          >
            Explorar categorías
          </a>
        </div>
      </main>
      <footer className="row-start-3 flex gap-[24px] flex-wrap items-center justify-center text-[#333333]">
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
        >
          Restaurantes
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
        >
          Categorías
        </a>
        <a
          className="flex items-center gap-2 hover:underline hover:underline-offset-4"
          href="#"
        >
          Contacto
        </a>
      </footer>
    </div>
  );
}
