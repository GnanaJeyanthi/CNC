import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

const CART_STORAGE_KEY = 'castncart_cart';

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem(CART_STORAGE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      console.warn('Failed to load cart from localStorage:', e);
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
    } catch (e) {
      console.warn('Failed to save cart to localStorage:', e);
    }
  }, [cartItems]);

  const addToCart = (product, quantity = 1) => {
    if (!product || !product.id && !product._id) return;
    const prodId = (product.id || product._id).toString();

    setCartItems((prevItems) => {
      const existingIndex = prevItems.findIndex((item) => item.id.toString() === prodId);
      const stock = product.stock !== undefined ? product.stock : 99;

      if (existingIndex > -1) {
        const updated = [...prevItems];
        const newQty = Math.min(stock, updated[existingIndex].quantity + quantity);
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
        };
        return updated;
      } else {
        const newItem = {
          id: prodId,
          _id: prodId,
          title: product.title || 'Product',
          price: product.price || 0,
          stock: stock,
          imageUrl: product.imageUrl || product.images?.[0]?.url || '',
          creatorName: product.creatorName || product.creatorId?.name || 'Creator',
          category: product.category || '',
          quantity: Math.min(stock, Math.max(1, quantity)),
        };
        return [...prevItems, newItem];
      }
    });
  };

  const removeFromCart = (productId) => {
    const idStr = productId.toString();
    setCartItems((prev) => prev.filter((item) => item.id.toString() !== idStr));
  };

  const updateQuantity = (productId, quantity) => {
    const idStr = productId.toString();
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems((prev) =>
      prev.map((item) =>
        item.id.toString() === idStr
          ? { ...item, quantity: Math.min(item.stock || 99, quantity) }
          : item
      )
    );
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((sum, item) => sum + (item.price || 0) * (item.quantity || 1), 0);
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        cartTotal,
        cartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};
