"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [cart, setCart] = useState([]);
  const [restaurante, setRestaurante] = useState(null);
  console.log("valor de negocio en CartProvider", restaurante);

  // Solo ejecutar en el cliente
  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem("cart");
    const savedNegocio = localStorage.getItem("restaurante");

    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      setRestaurante(parsedCart[0]?.restaurante || null);
      // Si hay items en el carrito, extraer la información del negocio del primer item
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isClient) return;

    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
      localStorage.setItem("restaurante", cart[0]?.restaurante);
      setRestaurante(cart[0]?.restaurante);
    } else {
      localStorage.removeItem("cart");
      localStorage.removeItem("restaurante");
    }
  }, [cart, isClient]);


  const addToCart = (product, quantity = 1) => {
    console.log(restaurante);
    console.log(product);
    console.log("carrito:", cart);
    // Si el carrito está vacío o el producto es del mismo negocio
    if (
      cart.length === 0 ||
      (restaurante && product.restaurante === restaurante)
    ) {
      if (cart.length === 0) {
        setRestaurante(product.restaurante);
      }

      setCart((prevCart) => {
        const existingProduct = prevCart.find((item) => item.id === product.id);

        if (existingProduct) {
          return prevCart.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + quantity }
              : item
          );
        }

        return [...prevCart, { ...product, quantity }];
      });
    } else {
      toast.error(
        "Los productos de diferentes negocios no pueden mezclarse en el carrito."
      );
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId);
      if (newCart.length === 0) {
        setRestaurante(null);
      }
      return newCart;
    });
  };

  const updateQuantity = (productId, quantity) => {
    if (quantity < 1) return;

    setCart((prevCart) =>
      prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const clearCart = () => {
    setCart([]);
    setRestaurante(null);
    if (isClient) {
      localStorage.removeItem("cart");
      localStorage.removeItem("restaurante");
      toast.success("Carrito vaciado");
    }
  };

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + item.precio * item.quantity, 0);
  };

  const getCartCount = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        restaurante,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isClient,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart debe ser usado dentro de un CartProvider");
  }
  return context;
}
