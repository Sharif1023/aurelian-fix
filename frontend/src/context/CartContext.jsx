import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import toast from 'react-hot-toast';

const CartContext = createContext(null);

const STORAGE_KEY = 'sharuu_cart';

export function CartProvider({ children }) {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);

      return saved
        ? JSON.parse(saved)
        : [];
    } catch {
      return [];
    }
  });

  /* =========================================
     SAVE CART TO LOCAL STORAGE
  ========================================= */

  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify(cartItems),
      );
    } catch {
      // Ignore localStorage errors
    }
  }, [cartItems]);

  /* =========================================
     ADD TO CART
  ========================================= */

  const addToCart = (
    product,
    quantity = 1,
    size = '',
    color = 'Default',
  ) => {
    if (!product) return;

    const productId = String(product.id);

    const selectedSize =
      size || '';

    const selectedColor =
      color || 'Default';

    const amount = Math.max(
      1,
      Number(quantity || 1),
    );

    setCartItems((current) => {
      const index = current.findIndex(
        (item) =>
          String(item.id) === productId &&
          String(item.selectedSize || '') ===
            String(selectedSize) &&
          String(
            item.selectedColor || 'Default',
          ) === String(selectedColor),
      );

      /* Existing same product + size + color */
      if (index >= 0) {
        return current.map(
          (item, itemIndex) =>
            itemIndex === index
              ? {
                  ...item,

                  quantity:
                    Number(
                      item.quantity || 0,
                    ) + amount,
                }
              : item,
        );
      }

      /* New cart item */
      return [
        ...current,

        {
          ...product,

          quantity: amount,

          selectedSize,

          selectedColor,
        },
      ];
    });

    /*
      IMPORTANT:
      Toast stays OUTSIDE setCartItems callback.
      This prevents duplicate toast in React StrictMode.
    */
    toast.success('Added to cart');
  };

  /* =========================================
     REMOVE FROM CART
  ========================================= */

  const removeFromCart = (
    productId,
    size = '',
    color = 'Default',
  ) => {
    setCartItems((items) =>
      items.filter(
        (item) =>
          !(
            String(item.id) ===
              String(productId) &&
            String(
              item.selectedSize || '',
            ) === String(size || '') &&
            String(
              item.selectedColor ||
                'Default',
            ) ===
              String(
                color || 'Default',
              )
          ),
      ),
    );

    toast.success(
      'Removed from cart',
    );
  };

  /* =========================================
     UPDATE QUANTITY
  ========================================= */

  const updateQuantity = (
    productId,
    quantity,
    size = '',
    color = 'Default',
  ) => {
    const nextQuantity =
      Math.max(
        1,
        Number(quantity || 1),
      );

    setCartItems((items) =>
      items.map((item) =>
        String(item.id) ===
          String(productId) &&
        String(
          item.selectedSize || '',
        ) === String(size || '') &&
        String(
          item.selectedColor ||
            'Default',
        ) ===
          String(color || 'Default')
          ? {
              ...item,
              quantity: nextQuantity,
            }
          : item,
      ),
    );
  };

  /* =========================================
     CLEAR CART
  ========================================= */

  const clearCart = () => {
    setCartItems([]);
  };

  /* =========================================
     TOTALS
  ========================================= */

  const subtotal = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(item.price || 0) *
            Number(
              item.quantity || 0,
            ),
        0,
      ),
    [cartItems],
  );

  const cartCount = useMemo(
    () =>
      cartItems.reduce(
        (sum, item) =>
          sum +
          Number(
            item.quantity || 0,
          ),
        0,
      ),
    [cartItems],
  );

  /* =========================================
     CONTEXT
  ========================================= */

  const value = useMemo(
    () => ({
      cartItems,

      addToCart,

      removeFromCart,

      updateQuantity,

      clearCart,

      subtotal,

      total: subtotal,

      cartCount,
    }),
    [
      cartItems,
      subtotal,
      cartCount,
    ],
  );

  return (
    <CartContext.Provider
      value={value}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const value =
    useContext(CartContext);

  if (!value) {
    throw new Error(
      'useCart must be used within CartProvider',
    );
  }

  return value;
}