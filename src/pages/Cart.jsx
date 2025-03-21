import React, { useState } from "react";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import "../styles/Cart.css";

const items = Array.from({ length: 100 }, (_, i) => ({
  id: i + 1,
  name: `Product ${i + 1}`,
  price: Math.floor(Math.random() * 1000) + 100,
  image: "https://via.placeholder.com/150",
}));

const Cart = () => {
  const { cart, addToCart, removeFromCart } = useCart();
  const navigate = useNavigate();
  const [discount, setDiscount] = useState(0);
  const [couponCode, setCouponCode] = useState("");
  const [couponError, setCouponError] = useState("");
  const [showCoupons, setShowCoupons] = useState(false);
  const [appliedCoupon, setAppliedCoupon] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  const cartItems = Object.keys(cart)
    .map((id) => {
      const item = items.find((item) => item.id === Number(id));
      return item ? { ...item, quantity: cart[id] } : null;
    })
    .filter(Boolean);

  const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const totalDiscount = cartItems.reduce((sum, item) => sum + (item.price * 0.1 * item.quantity), 0) + discount;
  const finalAmount = totalAmount - totalDiscount;

  const applyCoupon = (code) => {
    if (appliedCoupon) {
      setCouponError("Only one coupon can be applied at a time.");
      return;
    }

    let appliedDiscount = 0;
    if (code === "Trynew") {
      appliedDiscount = 100;
      setAppliedCoupon("Trynew - ₹100 off");
    } else if (code === "Gpay") {
      appliedDiscount = 50;
      setAppliedCoupon("Gpay - ₹50 off");
    } else if (code === "newuser") {
      appliedDiscount = 150;
      setAppliedCoupon("newuser - ₹150 off");
    } else {
      setDiscount(0);
      setAppliedCoupon("");
      setCouponError("Invalid coupon");
      return;
    }

    setDiscount(appliedDiscount);
    setCouponError("");
    setShowPopup(true);
    setTimeout(() => setShowPopup(false), 3000); // Hide popup after 3 seconds
  };

  const removeCoupon = () => {
    setDiscount(0);
    setAppliedCoupon("");
    setCouponCode("");
  };

  return (
    <div className="cart-container">
      {showPopup && <div className="coupon-popup">🎉 Yay! Coupon Applied</div>}

      <div className="cart-header">
        <h2>Your Cart</h2>
        <span className="saved-amount">SAVED ₹{totalDiscount.toFixed(2)}</span>
      </div>

      {cartItems.length === 0 ? (
        <p>Your cart is empty</p>
      ) : (
        <>
          {cartItems.map((item) => (
            <div key={item.id} className="cart-item">
              <img src={item.image} alt={item.name} className="cart-image" />
              <div className="cart-details">
                <p className="cart-name">{item.name}</p>
                <p className="cart-price">₹{item.price} x {item.quantity}</p>
              </div>
              <div className="counter">
                <button onClick={() => removeFromCart(item.id)}>-</button>
                <span>{item.quantity}</span>
                <button onClick={() => addToCart(item)}>+</button>
              </div>
            </div>
          ))}

          <div className="coupon-section">
            <div className="coupon-bar" onClick={() => setShowCoupons(!showCoupons)}>
              <span>💲 View Coupons & Offers</span>
            </div>
            {showCoupons && (
              <div className="coupon-dropdown">
                <input 
                  type="text" 
                  placeholder="Enter coupon code" 
                  value={couponCode} 
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <button onClick={() => applyCoupon(couponCode)}>Apply</button>
                {couponError && <p className="error-message">{couponError}</p>}
                <div className="available-coupons">
                  <h4>Available Coupons</h4>
                  <button onClick={() => applyCoupon("Trynew")} className="coupon-button">Trynew - ₹100 off</button>
                  <button onClick={() => applyCoupon("Gpay")} className="coupon-button">Gpay - ₹50 off</button>
                </div>
              </div>
            )}
            {appliedCoupon && (
              <div className="applied-coupon">
                <span>✅ {appliedCoupon}</span>
                <button onClick={removeCoupon} className="remove-coupon">Remove</button>
              </div>
            )}
          </div>

          <div className="special-offers">
            <h3>🎉 Special Offers For You</h3>
            <div className="offer-list">
              {items.slice(5, 10).map((item) => (
                <div key={item.id} className="offer-card">
                  <img src={item.image} alt={item.name} />
                  <h4>{item.name}</h4>
                  <span className="offer-price">₹{item.price} <s>₹{(item.price * 1.3).toFixed(2)}</s></span>
                  <div className="counter">
                    {cart[item.id] ? (
                      <>
                        <button onClick={() => removeFromCart(item.id)}>-</button>
                        <span>{cart[item.id]}</span>
                        <button onClick={() => addToCart(item)}>+</button>
                      </>
                    ) : (
                      <button className="add-offer-btn" onClick={() => addToCart(item)}>Add</button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="cart-summary">
            <p>Item Total: ₹{totalAmount}</p>
            {appliedCoupon && <p>Coupon Discount: -₹{discount}</p>}
            <p>Total Discount: ₹{totalDiscount.toFixed(2)}</p>
            <h3>Total: ₹{finalAmount.toFixed(2)}</h3>
          </div>

          <button className="checkout-button" onClick={() => navigate("/payment", { state: { amount: finalAmount } })}>
          Pay ₹{finalAmount.toFixed(2)}
          </button>
        </>
      )}
    </div>
  );
};

export default Cart;
