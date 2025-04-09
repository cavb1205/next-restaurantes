"use client";

import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import CheckoutForm from "@/components/checkout/CheckoutForm";

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, clearCart, isClient, negocio } = useCart();

  const handleCheckout = async (formData) => {
    try {
      // Aquí iría la lógica para enviar el pedido al backend
      console.log("Datos del pedido:", formData);

      // Simular envío exitoso
      alert("¡Pedido realizado con éxito!");
      clearCart();
      router.push("/"); // Redirigir al inicio
    } catch (error) {
      console.error("Error al procesar el pedido:", error);
      alert("Error al procesar el pedido. Por favor, intenta nuevamente.");
    }
  };

  if (!isClient) {
    return null; // O un componente de carga
  }

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-semibold text-primary mb-4">
            Carrito Vacío
          </h2>
          <p className="text-gray-600 mb-8">
            No hay productos en tu carrito de compras.
          </p>
          <button
            onClick={() => router.push("/restaurantes")}
            className="bg-primary text-white px-6 py-2 rounded-lg hover:bg-primary/90 transition-colors"
          >
            Ver Restaurantes
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-primary text-center mb-8">
          Finalizar Pedido
        </h1>
        <CheckoutForm onSubmit={handleCheckout} />
      </div>
    </div>
  );
}
