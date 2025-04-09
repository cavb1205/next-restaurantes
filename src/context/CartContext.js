"use client";

import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [isClient, setIsClient] = useState(false);
  const [cart, setCart] = useState([]);
  const [negocio, setNegocio] = useState(null);
  
  // Solo ejecutar en el cliente
  useEffect(() => {
    setIsClient(true);
    const savedCart = localStorage.getItem("cart");
    const savedNegocio = localStorage.getItem("negocio");
    
    if (savedCart) {
      const parsedCart = JSON.parse(savedCart);
      setCart(parsedCart);
      // Si hay items en el carrito, extraer la información del negocio del primer item
      if (parsedCart.length > 0 && parsedCart[0].negocio) {
        setNegocio(parsedCart[0].negocio);
      }
    }
    if (savedNegocio) {
      setNegocio(JSON.parse(savedNegocio));
    }
  }, []);

  // Guardar carrito en localStorage cuando cambie
  useEffect(() => {
    if (!isClient) return;

    if (cart.length > 0) {
      localStorage.setItem("cart", JSON.stringify(cart));
    } else {
      localStorage.removeItem("cart");
    }
  }, [cart, isClient]);

  // Guardar negocio en localStorage cuando cambie
  useEffect(() => {
    if (!isClient) return;

    if (negocio) {
      localStorage.setItem("negocio", JSON.stringify(negocio));
    } else {
      localStorage.removeItem("negocio");
    }
  }, [negocio, isClient]);

  const addToCart = (product, quantity = 1) => {
    try {
      // Si el carrito está vacío o el producto es del mismo negocio
      if (cart.length === 0 || (negocio && product.negocio.id === negocio.id)) {
        if (cart.length === 0) {
          setNegocio(product.negocio);
        }

        setCart((prevCart) => {
          const existingProduct = prevCart.find(
            (item) => item.id === product.id
          );

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
        throw new Error(
          "No puedes agregar productos de diferentes negocios al mismo carrito"
        );
      }
    } catch (error) {
      console.error("Error al agregar al carrito:", error);
      alert(error.message);
    }
  };

  const removeFromCart = (productId) => {
    setCart((prevCart) => {
      const newCart = prevCart.filter((item) => item.id !== productId);
      if (newCart.length === 0) {
        setNegocio(null);
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
    setNegocio(null);
    if (isClient) {
      localStorage.removeItem("cart");
      localStorage.removeItem("negocio");
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
        negocio,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        isClient
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
