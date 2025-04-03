import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-white border-t">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Sección de marca */}
          <div className="col-span-1 md:col-span-2">
            <Link href="/" className="text-2xl font-bold text-primary">
              Rico en Calama
            </Link>
            <p className="mt-4 text-secondary text-sm">
              Descubre los mejores restaurantes de Calama. Tu guía local para encontrar la mejor comida de la ciudad.
            </p>
          </div>

          {/* Enlaces rápidos */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Enlaces
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <Link href="/" className="text-secondary hover:text-primary text-sm">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/restaurantes" className="text-secondary hover:text-primary text-sm">
                  Restaurantes
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-sm font-semibold text-secondary uppercase tracking-wider">
              Contacto
            </h3>
            <ul className="mt-4 space-y-4">
              <li>
                <a
                  href="mailto:contacto@ricoencalama.com"
                  className="text-secondary hover:text-primary text-sm"
                >
                  contacto@ricoencalama.com
                </a>
              </li>
              <li>
                <a
                  href="tel:+56912345678"
                  className="text-secondary hover:text-primary text-sm"
                >
                  +56 9 1234 5678
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="mt-12 pt-8 border-t border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-secondary text-sm">
              © {new Date().getFullYear()} Rico en Calama. Todos los derechos reservados.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <a
                href="#"
                className="text-secondary hover:text-primary text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Instagram
              </a>
              <a
                href="#"
                className="text-secondary hover:text-primary text-sm"
                target="_blank"
                rel="noopener noreferrer"
              >
                Facebook
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
} 