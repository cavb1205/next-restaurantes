"use client";

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useCart } from "@/context/CartContext";
import { useRouter } from "next/navigation";

export default function CartModal({ isOpen, setIsOpen }) {
  const router = useRouter();
  const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } =
    useCart();

  const handleCheckout = () => {
    setIsOpen(false);
    router.push("/checkout");
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={setIsOpen}>
        <Transition.Child
          as={Fragment}
          enter="ease-in-out duration-500"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in-out duration-500"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <Transition.Child
                as={Fragment}
                enter="transform transition ease-in-out duration-500"
                enterFrom="translate-x-full"
                enterTo="translate-x-0"
                leave="transform transition ease-in-out duration-500"
                leaveFrom="translate-x-0"
                leaveTo="translate-x-full"
              >
                <Dialog.Panel className="pointer-events-auto w-screen max-w-md">
                  <div className="flex h-full flex-col overflow-y-scroll bg-white shadow-xl">
                    <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
                      <div className="flex items-start justify-between">
                        <Dialog.Title className="text-lg font-medium text-primary">
                          Carrito de Compras
                        </Dialog.Title>
                        <div className="ml-3 flex h-7 items-center">
                          <button
                            type="button"
                            className="relative -m-2 p-2 text-gray-400 hover:text-gray-500"
                            onClick={() => setIsOpen(false)}
                          >
                            <span className="absolute -inset-0.5" />
                            <span className="sr-only">Cerrar panel</span>
                            <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-8">
                        <div className="flow-root">
                          {cart.length === 0 ? (
                            <p className="text-center text-gray-500 py-8">
                              Tu carrito está vacío
                            </p>
                          ) : (
                            <ul
                              role="list"
                              className="-my-6 divide-y divide-gray-200"
                            >
                              {cart.map((product) => (
                                <li key={product.id} className="flex py-6">
                                  <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                                    <img
                                      src={`${process.env.NEXT_PUBLIC_API_URL}${product.imagen.url}`}
                                      alt={product.nombre}
                                      className="h-full w-full object-cover object-center"
                                    />
                                  </div>

                                  <div className="ml-4 flex flex-1 flex-col">
                                    <div>
                                      <div className="flex justify-between text-base font-medium text-gray-900">
                                        <h3 className="capitalize">
                                          {product.nombre}
                                        </h3>
                                        <p className="ml-4 text-primary">
                                          {(
                                            product.precio * product.quantity
                                          ).toLocaleString("es-CL", {
                                            style: "currency",
                                            currency: "CLP",
                                          })}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex flex-1 items-end justify-between text-sm">
                                      <div className="flex items-center gap-2">
                                        <p className="text-gray-500">
                                          Cantidad
                                        </p>
                                        <select
                                          value={product.quantity}
                                          onChange={(e) =>
                                            updateQuantity(
                                              product.id,
                                              parseInt(e.target.value)
                                            )
                                          }
                                          className="rounded-md border-gray-300 py-1.5 text-base leading-5 focus:border-primary focus:ring-primary"
                                        >
                                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(
                                            (number) => (
                                              <option
                                                key={number}
                                                value={number}
                                              >
                                                {number}
                                              </option>
                                            )
                                          )}
                                        </select>
                                      </div>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          removeFromCart(product.id)
                                        }
                                        className="font-medium text-red-600 hover:text-red-500"
                                      >
                                        <TrashIcon className="h-5 w-5" />
                                      </button>
                                    </div>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      </div>
                    </div>

                    {cart.length > 0 && (
                      <div className="border-t border-gray-200 px-4 py-6 sm:px-6">
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <p>Total</p>
                          <p className="text-primary font-bold">
                            {getCartTotal().toLocaleString("es-CL", {
                              style: "currency",
                              currency: "CLP",
                            })}
                          </p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                          Envío calculado al finalizar la compra.
                        </p>
                        <div className="mt-6 space-y-2">
                          <button
                            onClick={handleCheckout}
                            className="flex w-full items-center justify-center rounded-md border border-transparent bg-primary px-6 py-3 text-base font-medium text-white shadow-sm hover:bg-primary/90"
                          >
                            Proceder al pago
                          </button>
                          <button
                            onClick={clearCart}
                            className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-6 py-3 text-base font-medium text-gray-700 shadow-sm hover:bg-gray-50"
                          >
                            Vaciar carrito
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
