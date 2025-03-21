import React, { createContext, useState, useContext } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState({}); // Store item IDs with quantity

  const addToCart = (item) => {
    setCart((prevCart) => ({
      ...prevCart,
      [item.id]: (prevCart[item.id] || 0) + 1, // Increase quantity
    }));
  };

  const removeFromCart = (id) => {
    setCart((prevCart) => {
      if (!prevCart[id]) return prevCart; // If not in cart, do nothing

      const updatedCart = { ...prevCart };
      if (updatedCart[id] === 1) {
        delete updatedCart[id]; // Remove if quantity reaches 0
      } else {
        updatedCart[id] -= 1; // Decrease quantity
      }
      return updatedCart;
    });
  };

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
