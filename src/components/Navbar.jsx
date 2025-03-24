import { Link } from "react-router-dom";

function Navbar() {
  return (
    <nav className="bg-gray-800 p-4 shadow-lg">
      <div className="container mx-auto flex justify-between items-center">
        <h2 className="text-white text-2xl font-bold">Venditt</h2>
        <div className="flex space-x-4">
          <Link
            className="text-gray-300 hover:text-white transition duration-300"
            to="/"
          >
            Home
          </Link>
          <Link
            className="text-gray-300 hover:text-white transition duration-300"
            to="/locate"
          >
            Locate
          </Link>
          {/* <Link
            className="text-gray-300 hover:text-white transition duration-300"
            to="/offers"
          >
            Offers
          </Link> */}
          <Link
            className="text-gray-300 hover:text-white transition duration-300"
            to="/orders"
          >
            Orders
          </Link>
          <Link
            className="text-gray-300 hover:text-white transition duration-300"
            to="/profile"
          >
            Profile
          </Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
