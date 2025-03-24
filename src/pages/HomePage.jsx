import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, onSnapshot } from "firebase/firestore";
import SplashScreen from "../components/SplashScreen";

import loginIcon from "../assets/login-icon.png";
import logoImage from "../assets/venditt-logo.png";
import cartIcon from "../assets/cart-image.png";
import "../styles/HomePage.css";

function HomePage() {
  const [showSplash, setShowSplash] = useState(
    !localStorage.getItem("visited")
  );
  const [currentLocation, setCurrentLocation] = useState(
    "Fetching location..."
  );
  const [user, setUser] = useState(null);
  const [username, setUsername] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [loadingLocation, setLoadingLocation] = useState(true);
  const [cartItemCount, setCartItemCount] = useState(0);
  const navigate = useNavigate();

  // Categories data with web images
  const categories = [
    {
      name: "Snacks",
      image: "https://images.unsplash.com/photo-1550583724-b2692b85b150",
      path: "/products?category=snacks",
    },
    {
      name: "Drinks",
      image: "https://images.unsplash.com/photo-1551029506-0807df4e2031",
      path: "/products?category=drinks",
    },
    {
      name: "Ice Cream",
      image: "https://images.unsplash.com/photo-1566566220367-af8d77209124",
      path: "/products?category=icecream",
    },
    {
      name: "Healthy Options",
      image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
      path: "/products?category=healthy",
    },
  ];

  // Handle splash screen timeout
  useEffect(() => {
    if (showSplash) {
      const timer = setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem("visited", "true");
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSplash]);

  // Auth state listener and cart subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (loggedInUser) => {
      if (loggedInUser) {
        setUser(loggedInUser);
        try {
          // Get user data
          const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
          if (userDoc.exists()) {
            setUsername(userDoc.data().name);
          }

          // Subscribe to cart updates
          const cartRef = doc(db, "carts", loggedInUser.uid);
          const unsubscribeCart = onSnapshot(cartRef, (cartDoc) => {
            if (cartDoc.exists()) {
              const cartData = cartDoc.data();
              const itemCount =
                cartData.items?.reduce(
                  (total, item) => total + item.quantity,
                  0
                ) || 0;
              setCartItemCount(itemCount);
            } else {
              setCartItemCount(0);
            }
          });

          return () => unsubscribeCart();
        } catch (error) {
          console.error("Error fetching user data:", error);
        }
      } else {
        setUser(null);
        setUsername("");
        setCartItemCount(0);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch user location with better place name resolution
  useEffect(() => {
    const fetchLocation = async () => {
      setLoadingLocation(true);
      const storedLocation = localStorage.getItem("selectedLocation");

      if (storedLocation) {
        setCurrentLocation(storedLocation);
        setLoadingLocation(false);
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const { latitude: lat, longitude: lng } = position.coords;
              const response = await fetch(
                `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
              );
              const data = await response.json();

              if (data.address) {
                // Construct a readable address
                let addressParts = [];
                if (data.address.road) addressParts.push(data.address.road);
                if (data.address.suburb) addressParts.push(data.address.suburb);
                if (data.address.city) addressParts.push(data.address.city);
                if (data.address.state) addressParts.push(data.address.state);

                const readableAddress =
                  addressParts.join(", ") ||
                  data.display_name ||
                  "Your current location";

                setCurrentLocation(readableAddress);
                localStorage.setItem("selectedLocation", readableAddress);
              } else {
                setCurrentLocation("Your current location");
              }
            } catch (error) {
              console.error("Geocoding error:", error);
              setCurrentLocation("Your current location");
            } finally {
              setLoadingLocation(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setCurrentLocation("Enable location for better experience");
            setLoadingLocation(false);
          },
          { timeout: 10000 }
        );
      } else {
        setCurrentLocation("Location not available");
        setLoadingLocation(false);
      }
    };
    fetchLocation();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const handleLocationClick = () => {
    navigate("/location");
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery(""); // Clear search after submission
    }
  };

  const handleViewOffers = () => {
    navigate("/offers-rewards");
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <Link to="/">
            <img src={logoImage} alt="Venditt Logo" className="logo" />
          </Link>
          <div
            className={`location ${loadingLocation ? "loading" : ""}`}
            onClick={handleLocationClick}
          >
            <span className="location-icon">📍</span>
            <span className="current-location">
              {loadingLocation ? "Locating..." : currentLocation}
            </span>
          </div>
        </div>

        <div className="nav-right">
          <form onSubmit={handleSearch} className="search-form">
            <div className="search-container">
              <input
                type="text"
                className="search-bar"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                aria-label="Search products"
              />
              <button type="submit" className="search-button">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  fill="currentColor"
                  viewBox="0 0 16 16"
                >
                  <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z" />
                </svg>
                Search
              </button>
            </div>
          </form>

          <Link to="/cart" className="cart-button">
            <img src={cartIcon} alt="Cart" className="cart-icon" />
            {cartItemCount > 0 && (
              <span className="cart-badge">{cartItemCount}</span>
            )}
          </Link>

          <div
            className="user-container"
            onMouseEnter={() => setShowDropdown(true)}
            onMouseLeave={() => setShowDropdown(false)}
          >
            {user ? (
              <>
                <div className="profile-icon">
                  {username ? username.charAt(0).toUpperCase() : "U"}
                </div>
                {showDropdown && (
                  <div className="dropdown-menu">
                    <p>Welcome, {username || "User"} 👋</p>
                    <button onClick={() => navigate("/profile")}>
                      Profile
                    </button>
                    <button onClick={() => navigate("/orders")}>
                      My Orders
                    </button>
                    <button onClick={handleLogout}>Logout</button>
                  </div>
                )}
              </>
            ) : (
              <Link to="/login" className="login-button">
                <img src={loginIcon} alt="Login" className="login-icon" /> Login
              </Link>
            )}
          </div>
        </div>
      </nav>

      <header className="hero-section">
        <h1>Find & Enjoy Your Favorite Snacks</h1>
        <p>Instant vending at your fingertips.</p>
        <div className="hero-buttons">
          <Link to="/products" className="btn hover-effect">
            Explore Products
          </Link>
          <Link to="/locate" className="btn hover-effect">
            Find Machines
          </Link>
        </div>
      </header>

      <section className="categories">
        <h2>What's on your mind?</h2>
        <div className="category-list">
          {categories.map((category, index) => (
            <Link
              to={category.path}
              key={index}
              className="category-item hover-effect"
            >
              <div
                className="category-image"
                style={{
                  backgroundImage: `url(${category.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
              <span>{category.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="offers">
        <div className="offers-content" onClick={handleViewOffers}>
          <h2>Top Deals for You</h2>
          <p>Save more on your favorite vending options.</p>
          <button className="view-offers-btn">View All Offers</button>
        </div>
      </section>

      <div className="after-offers-spacing"></div>

      <footer className="bottom-nav">
        <Link to="/profile" className="bottom-nav-item">
          Profile
        </Link>
        <Link to="/orders" className="bottom-nav-item">
          Orders
        </Link>
        <Link to="/support" className="bottom-nav-item">
          Support
        </Link>
        <Link to="/about" className="bottom-nav-item">
          About Us
        </Link>
      </footer>
    </div>
  );
}

export default HomePage;
