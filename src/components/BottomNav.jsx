import { Link } from "react-router-dom";
import "../styles/BottomNav.css"; // ✅ Make sure this file exists

function BottomNav() {
  return (
    <div className="bottom-nav">
      <Link to="/" className="nav-item">Home</Link>
      <Link to="/products" className="nav-item">Categories</Link>
      <Link to="/offers" className="nav-item">Wishlist</Link>
      <Link to="/cart" className="nav-item">Cart</Link>
    </div>
  );
}

export default BottomNav;
