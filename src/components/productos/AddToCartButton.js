"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";

export default function AddToCartButton({ product }) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = () => {
    addToCart(product);
    setIsAdding(true);

    // Mostrar feedback visual
    setTimeout(() => {
      setIsAdding(false);
    }, 1000);
  };

  return (
    <button
      onClick={handleAddToCart}
      disabled={isAdding}
      className={`w-full font-medium py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-primary/20
        ${isAdding 
          ? 'bg-green-500 text-white cursor-not-allowed'
          : 'bg-primary hover:bg-primary/90 text-white'
        }`}
      aria-label={`Agregar ${product.nombre} al carrito`}
    >
      {isAdding ? (
        <span className="flex items-center justify-center">
          ¡Agregado! ✓
        </span>
      ) : (
        <span className="flex items-center justify-center">
          Agregar
          <span className="ml-2" aria-hidden="true">
            +
          </span>
        </span>
      )}
    </button>
  );
} 