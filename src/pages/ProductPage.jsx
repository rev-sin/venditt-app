import React from "react";
import "../styles/ProductPage.css";
import { useCart } from "../context/CartContext"; // Import Cart Context

const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 100,
  discount: Math.floor(Math.random() * 50) + 10,
  image: "https://via.placeholder.com/150",
}));

const recommendations = [
  "Best Selling Snacks",
  "Healthy Choices",
  "Limited Time Offers",
  "Customer Favorites",
  "New Arrivals",
];

function ProductPage() {
  const { cart, addToCart, removeFromCart } = useCart(); // Get cart state functions

  return (
    <div className="explore-container">
      <h2>Explore Menu</h2>
      <div className="item-list">
        {items.map((item, index) => (
          <React.Fragment key={item.id}>
            {index % 10 === 0 && index !== 0 && (
              <div key={`rec-${index}`} className="recommendation">
                <h3>{recommendations[(index / 10) % recommendations.length]}</h3>
              </div>
            )}
            <div className="item-card">
              {item.discount > 0 && (
                <span className="discount-badge">{item.discount}% Off</span>
              )}
              <img src={item.image} alt={item.name} className="item-image" />
              <p className="item-name">{item.name}</p>
              <p className="item-price">₹{item.price}</p>

              {/* Check if item is in cart, show counter or Add button */}
              {cart[item.id] ? (
                <div className="counter">
                  <button onClick={() => removeFromCart(item.id)}>-</button>
                  <span>{cart[item.id]}</span>
                  <button onClick={() => addToCart(item)}>+</button>
                </div>
              ) : (
                <button className="add-button" onClick={() => addToCart(item)}>
                  Add
                </button>
              )}
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
}

export default ProductPage;
