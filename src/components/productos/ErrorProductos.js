export default function ErrorProductos() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[300px] bg-red-50 rounded-xl p-8 space-y-4 animate-fade-in">
          <svg 
            className="w-16 h-16 text-red-400" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="text-xl font-semibold text-red-600">Error de conexión</h3>
          <div className="text-center space-y-2">
            <p className="text-red-500/90 max-w-md text-sm md:text-base">
              No pudimos cargar el menú del establecimiento
            </p>
            <p className="text-secondary/80 text-xs md:text-sm">
              Por favor intenta nuevamente más tarde
            </p>
          </div>
        </div>
      );
}