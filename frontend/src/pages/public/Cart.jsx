import {
  Trash2,
  Minus,
  Plus,
  Lock,
  ArrowLeft,
  ShoppingBag,
} from 'lucide-react';

import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { motion, AnimatePresence } from 'motion/react';

export default function Cart() {
  const {
    cartItems,
    updateQuantity,
    removeFromCart,
    subtotal,
  } = useCart();

  const finalTotal = subtotal;

  return (
    <main className="pt-24 pb-32 px-4 sm:px-6 max-w-7xl mx-auto min-h-screen">
      {/* ======================================
          PAGE HEADER
      ====================================== */}

      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-7 sm:mb-12">
        <div>
          <p className="text-[10px] uppercase tracking-[0.25em] text-on-surface-variant/50 font-bold mb-2">
            Shopping Bag
          </p>

          <h1 className="font-headline text-3xl sm:text-4xl font-extrabold tracking-tight">
            Your Cart
          </h1>

          {cartItems.length > 0 && (
            <p className="text-xs text-on-surface-variant/50 mt-2">
              {cartItems.reduce(
                (sum, item) =>
                  sum + Number(item.quantity || 0),
                0,
              )}{' '}
              item(s) in your cart
            </p>
          )}
        </div>

        <Link
          to="/collection"
          className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-primary flex items-center gap-2 hover:underline underline-offset-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </Link>
      </div>

      {cartItems.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16">
          {/* ======================================
              CART ITEMS
          ====================================== */}

          <div className="lg:col-span-8 space-y-4 sm:space-y-8">
            <AnimatePresence mode="popLayout">
              {cartItems.map((item) => {
                const unitPrice = Number(item.price || 0);
                const quantity = Number(item.quantity || 1);
                const itemTotal = unitPrice * quantity;

                return (
                  <motion.div
                    key={`${item.id}-${item.selectedSize}-${item.selectedColor}`}
                    layout
                    initial={{
                      opacity: 0,
                      x: -20,
                    }}
                    animate={{
                      opacity: 1,
                      x: 0,
                    }}
                    exit={{
                      opacity: 0,
                      x: 20,
                    }}
                    className="
                      bg-white
                      border border-outline-variant/15
                      rounded-2xl
                      p-3 sm:p-0
                      sm:border-x-0 sm:border-t-0
                      sm:rounded-none
                      sm:pb-10
                      shadow-sm sm:shadow-none
                    "
                  >
                    {/* =================================
                        MOBILE PRODUCT CARD
                    ================================= */}

                    <div className="flex gap-3 sm:gap-5">
                      {/* Image */}

                      <Link
                        to={`/product/${item.id}`}
                        className="
                          w-[92px]
                          h-[116px]
                          sm:w-32
                          sm:h-auto
                          sm:aspect-[4/5]
                          bg-surface-low
                          overflow-hidden
                          rounded-xl
                          flex-shrink-0
                        "
                      >
                        {item.image ? (
                          <img
                            className="w-full h-full object-cover"
                            src={item.image}
                            alt={item.name}
                            referrerPolicy="no-referrer"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="w-5 h-5 text-black/20" />
                          </div>
                        )}
                      </Link>

                      {/* Product info */}

                      <div className="flex-1 min-w-0 flex flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <Link
                              to={`/product/${item.id}`}
                              className="block"
                            >
                              <h3 className="text-sm sm:text-lg font-bold uppercase tracking-wide line-clamp-2 hover:opacity-70 transition-opacity">
                                {item.name}
                              </h3>
                            </Link>

                            {/* Size & Color */}

                            <div className="flex flex-wrap gap-1.5 mt-2">
                              {item.selectedSize && (
                                <span className="px-2 py-1 bg-surface-low rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                  Size: {item.selectedSize}
                                </span>
                              )}

                              {item.selectedColor &&
                                item.selectedColor !==
                                  'Default' && (
                                  <span className="px-2 py-1 bg-surface-low rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                    Color: {item.selectedColor}
                                  </span>
                                )}

                              {(!item.selectedColor ||
                                item.selectedColor ===
                                  'Default') && (
                                <span className="px-2 py-1 bg-surface-low rounded-md text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-on-surface-variant">
                                  Color: Default
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Delete */}

                          <button
                            type="button"
                            onClick={() =>
                              removeFromCart(
                                item.id,
                                item.selectedSize,
                                item.selectedColor,
                              )
                            }
                            className="
                              w-8 h-8
                              flex items-center justify-center
                              rounded-full
                              text-on-surface-variant/50
                              hover:text-red-600
                              hover:bg-red-50
                              transition-colors
                              flex-shrink-0
                            "
                            aria-label="Remove product"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Price info */}

                        <div className="mt-auto pt-3">
                          <div className="flex items-end justify-between gap-2">
                            <div>
                              <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/40 font-bold">
                                Unit Price
                              </p>

                              <p className="text-xs sm:text-sm font-semibold text-on-surface-variant">
                                ৳{unitPrice.toFixed(2)}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-[9px] uppercase tracking-wider text-on-surface-variant/40 font-bold">
                                Total
                              </p>

                              <p className="font-headline font-black text-base sm:text-lg text-primary">
                                ৳{itemTotal.toFixed(2)}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* =================================
                        QUANTITY CONTROL
                    ================================= */}

                    <div className="mt-4 sm:mt-6 flex items-center justify-between gap-3">
                      <span className="text-[10px] uppercase tracking-widest font-bold text-on-surface-variant/50">
                        Quantity
                      </span>

                      <div className="flex items-center bg-surface-low rounded-full p-1">
                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity - 1,
                              item.selectedSize,
                              item.selectedColor,
                            )
                          }
                          className="
                            w-9 h-9
                            rounded-full
                            flex items-center justify-center
                            hover:bg-white
                            active:scale-90
                            transition-all
                          "
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>

                        <span className="mx-3 sm:mx-5 font-bold text-sm min-w-[18px] text-center">
                          {item.quantity}
                        </span>

                        <button
                          type="button"
                          onClick={() =>
                            updateQuantity(
                              item.id,
                              item.quantity + 1,
                              item.selectedSize,
                              item.selectedColor,
                            )
                          }
                          className="
                            w-9 h-9
                            rounded-full
                            flex items-center justify-center
                            hover:bg-white
                            active:scale-90
                            transition-all
                          "
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>

          {/* ======================================
              ORDER SUMMARY
          ====================================== */}

          <div className="lg:col-span-4">
            <div className="bg-surface-low p-5 sm:p-8 rounded-2xl lg:sticky lg:top-24">
              <h2 className="text-lg sm:text-xl font-bold mb-6 sm:mb-8 tracking-tight">
                Order Summary
              </h2>

              <div className="space-y-4 mb-7">
                <div className="flex justify-between text-on-surface-variant text-sm">
                  <span>Subtotal</span>

                  <span className="font-semibold text-on-surface">
                    ৳{subtotal.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-start gap-4 text-on-surface-variant">
                  <span className="text-sm">
                    Shipping
                  </span>

                  <span className="text-[9px] sm:text-[10px] uppercase font-bold tracking-widest text-right">
                    Calculated at checkout
                  </span>
                </div>

                <div className="pt-4 border-t border-outline-variant/30 flex justify-between items-center">
                  <span className="text-base sm:text-lg font-bold">
                    Total
                  </span>

                  <span className="font-headline text-xl sm:text-2xl font-black">
                    ৳{finalTotal.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Checkout */}

              <Link
                to="/checkout"
                className="
                  w-full
                  bg-primary
                  text-white
                  py-4 sm:py-5
                  rounded-full
                  font-bold
                  uppercase
                  tracking-[0.15em] sm:tracking-[0.2em]
                  text-[11px] sm:text-xs
                  shadow-lg
                  hover:shadow-xl
                  transition-all
                  active:scale-[0.98]
                  text-center
                  block
                "
              >
                Proceed to Checkout
              </Link>

              <div className="mt-4 text-center">
                <span className="text-[9px] sm:text-[10px] uppercase tracking-widest text-on-surface-variant flex items-center justify-center gap-1 font-medium">
                  <Lock className="w-3 h-3" />
                  Secure encrypted checkout
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* ======================================
            EMPTY CART
        ====================================== */

        <div className="py-24 sm:py-32 text-center">
          <div className="w-20 h-20 mx-auto rounded-full bg-surface-low flex items-center justify-center mb-6">
            <ShoppingBag className="w-8 h-8 text-on-surface-variant/30" />
          </div>

          <h2 className="text-xl sm:text-2xl font-bold mb-3">
            Your cart is empty
          </h2>

          <p className="text-on-surface-variant font-light mb-8 text-sm">
            Looks like you haven't added anything yet.
          </p>

          <Link
            to="/collection"
            className="px-10 sm:px-12 py-4 sm:py-5 bg-primary text-white rounded-full font-bold uppercase tracking-[0.15em] sm:tracking-[0.2em] text-xs shadow-lg hover:opacity-90 transition-opacity inline-block"
          >
            Explore Collection
          </Link>
        </div>
      )}
    </main>
  );
}