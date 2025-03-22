import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import SplashScreen from "../components/SplashScreen";

import loginIcon from "../assets/login-icon.png";
import logoImage from "../assets/venditt-logo.png";

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
  const navigate = useNavigate();

  useEffect(() => {
    if (showSplash) {
      setTimeout(() => {
        setShowSplash(false);
        localStorage.setItem("visited", "true");
      }, 3000);
    }
  }, [showSplash]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (loggedInUser) => {
      if (loggedInUser) {
        setUser(loggedInUser);
        const userDoc = await getDoc(doc(db, "users", loggedInUser.uid));
        if (userDoc.exists()) {
          setUsername(userDoc.data().name);
        }
      } else {
        setUser(null);
        setUsername("");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchLocation = async () => {
      const storedLocation = localStorage.getItem("selectedLocation");
      if (storedLocation) {
        setCurrentLocation(storedLocation);
        return;
      }

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;

            try {
              const response = await fetch(
                `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=AIzaSyD6oR6e-7GCylEFsGhv5LZqQMB27N28j38`
              );
              const data = await response.json();

              if (data.status === "OK" && data.results.length > 0) {
                const formattedAddress = data.results[0].formatted_address;
                setCurrentLocation(formattedAddress);
                localStorage.setItem("selectedLocation", formattedAddress);
              } else {
                setCurrentLocation("Location not found");
              }
            } catch (error) {
              setCurrentLocation("Error fetching location");
              console.log(error);
            }
          },
          (error) => {
            setCurrentLocation("Location access denied");
            console.log(error);
          }
        );
      } else {
        setCurrentLocation("Geolocation not supported");
      }
    };

    fetchLocation();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    setUser(null);
    navigate("/");
  };

  const handleLocationClick = () => {
    navigate("/location");
  };

  if (showSplash) {
    return <SplashScreen />;
  }

  return (
    <div className="home-container">
      <nav className="navbar">
        <div className="nav-left">
          <img src={logoImage} alt="Venditt Logo" className="logo" />
          <div className="location" onClick={handleLocationClick}>
            <span className="location-icon">📍</span>
            <span className="current-location">{currentLocation}</span>
          </div>
        </div>

        <div className="nav-right">
          <input type="text" className="search-bar" placeholder="Search..." />
          <Link to="/cart" className="cart-button">
            <img alt="Cart" className="cart-icon" />
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
                    <p>Welcome, {username ? username : "User"} 👋</p>
                    <button onClick={() => navigate("/profile")}>
                      Profile
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
        <h2>What’s on your mind?</h2>
        <div className="category-list">
          <div className="category-item hover-effect">
            <img src="/assets/snacks.jpg" alt="Snacks" />
            Snacks
          </div>
          <div className="category-item hover-effect">
            <img src="/assets/drinks.jpg" alt="Drinks" />
            Drinks
          </div>
          <div className="category-item hover-effect">
            <img src="/assets/icecream.jpg" alt="Ice Cream" />
            Ice Cream
          </div>
          <div className="category-item hover-effect">
            <img src="/assets/healthy.jpg" alt="Healthy Options" />
            Healthy Options
          </div>
        </div>
      </section>

      <section
        className="offers"
        onClick={() => (window.location.href = "/offers")}
      >
        <h2>Top Deals for You</h2>
        <p>Save more on your favorite vending options.</p>
      </section>

      <nav className="bottom-nav">
        <Link to="/profile" className="bottom-nav-item">
          Profile
        </Link>
        <Link to="/history" className="bottom-nav-item">
          History
        </Link>
      </nav>
    </div>
  );
}

export default HomePage;
