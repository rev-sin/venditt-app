import { Link } from "react-router-dom";


function Navbar() {
  return (
    <nav>
      <h2>Venditt</h2>
      <div>
        <Link to="/">Home</Link>
        <Link to="/locate">Locate</Link>
        <Link to="/offers">Offers</Link>
        <Link to="/history">History</Link>
        <Link to="/profile">Profile</Link>
      </div>
    </nav>
  );
}

export default Navbar;
