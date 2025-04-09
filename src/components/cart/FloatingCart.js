"use client";

import { useState } from "react";
import { useCart } from "@/context/CartContext";
import { ShoppingCartIcon } from "@heroicons/react/24/outline";
import CartModal from "./CartModal";

export default function FloatingCart() {
  const { cart, getCartCount, getCartTotal } = useCart();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const itemCount = getCartCount();

  if (itemCount === 0) return null;

  return (
    <>
      <div className="fixed bottom-40 right-8 z-50">
        <button 
          onClick={() => setIsModalOpen(true)}
          className="relative bg-primary hover:bg-primary/90 text-white p-3 rounded-full shadow-lg transform transition-all duration-300 hover:scale-110 group"
        >
          <ShoppingCartIcon className="h-6 w-6" />
          
          {/* Contador de items */}
          <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
            {itemCount}
          </span>

          {/* Tooltip con el total */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-white text-gray-900 px-4 py-2 rounded-lg shadow-md text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
            Total: {getCartTotal().toLocaleString("es-CL", {
              style: "currency",
              currency: "CLP",
            })}
            <span className="absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 bg-white transform rotate-45" />
          </div>
        </button>
      </div>

      <CartModal isOpen={isModalOpen} setIsOpen={setIsModalOpen} />
    </>
  );
} 