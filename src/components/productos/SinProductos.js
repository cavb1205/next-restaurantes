export default function SinProductos() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-primary/5 rounded-xl p-8 space-y-4 animate-fade-in">
          <svg
            className="w-16 h-16 text-primary/60"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
            />
          </svg>
          <h3 className="text-xl font-semibold text-primary">Menú vacío</h3>
          <p className="text-secondary/80 max-w-md text-center text-sm md:text-base">
            Actualmente no hay productos disponibles en esta categoria o establecimiento.
          </p>
        </div>
  );
}
