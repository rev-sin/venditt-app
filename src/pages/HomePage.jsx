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

  // Categories data
  const categories = [
    {
      name: "Snacks",
      image: "/assets/snacks.jpg",
      path: "/products?category=snacks",
    },
    {
      name: "Drinks",
      image: "/assets/drinks.jpg",
      path: "/products?category=drinks",
    },
    {
      name: "Ice Cream",
      image: "/assets/icecream.jpg",
      path: "/products?category=icecream",
    },
    {
      name: "Healthy Options",
      image: "/assets/healthy.jpg",
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

  // Fetch user location
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
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD6oR6e-7GCylEFsGhv5LZqQMB27N28j38`
              );
              const data = await response.json();

              if (data.status === "OK" && data.results.length > 0) {
                const address = data.results[0].formatted_address;
                setCurrentLocation(address);
                localStorage.setItem("selectedLocation", address);
              } else {
                setCurrentLocation("Location not found");
              }
            } catch (error) {
              console.error("Geocoding error:", error);
              setCurrentLocation("Error fetching location");
            } finally {
              setLoadingLocation(false);
            }
          },
          (error) => {
            console.error("Geolocation error:", error);
            setCurrentLocation("Location access denied");
            setLoadingLocation(false);
          },
          { timeout: 10000 }
        );
      } else {
        setCurrentLocation("Geolocation not supported");
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
    }
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
              />
              <button type="submit" className="search-button">
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
              <img src={category.image} alt={category.name} />
              {category.name}
            </Link>
          ))}
        </div>
      </section>

      <section className="offers">
        <div className="offers-content" onClick={() => navigate("/offers")}>
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
