import { Link } from "react-router-dom";

function BottomNav() {
  return (
    <div className="bg-gray-800 text-white fixed bottom-0 w-full flex justify-around py-4">
      <Link to="/" className="nav-item text-center">
        Home
      </Link>
      <Link to="/products" className="nav-item text-center">
        Categories
      </Link>
      <Link to="/offers" className="nav-item text-center">
        Wishlist
      </Link>
      <Link to="/cart" className="nav-item text-center">
        Cart
      </Link>
    </div>
  );
}

export default BottomNav;
