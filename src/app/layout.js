import { CartProvider } from "@/context/CartContext";
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";
import FloatingCart from "@/components/cart/FloatingCart";
import { Toaster } from "sonner";
import "./globals.css";

export const metadata = {
  title: "Rico en Calama",
  description: "Los mejores restaurantes de Calama",
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className="flex flex-col min-h-screen">
        <CartProvider>
          <Navigation />
          <main className="flex-grow">
            {children}
          </main>
          <Toaster toastOptions={{classNames:{toast:'!text-primary !font-bold'}}} />
          <FloatingCart />
          <Footer />
        </CartProvider>
      </body>
    </html>
  );
}
