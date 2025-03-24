import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import "../styles/Location.css";

const containerStyle = {
  width: "100%",
  height: "400px",
  borderRadius: "12px",
  boxShadow: "0 2px 10px rgba(0, 0, 0, 0.1)",
};

function Location() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({
    name: "",
    house: "",
    street: "",
    city: "",
    phone: "",
    type: "Home",
  });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  // Get current user and their saved addresses
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      if (user) {
        try {
          const q = query(
            collection(db, "addresses"),
            where("userId", "==", user.uid)
          );
          const querySnapshot = await getDocs(q);
          const addresses = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          setSavedAddresses(addresses);
        } catch (err) {
          console.error("Error fetching addresses:", err);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Get user's current location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setLocation(newLocation);
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setError("Please enable location access for better experience");
          setLocation({ lat: 28.6139, lng: 77.209 }); // Default location
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  }, []);

  const handleSaveAddress = async () => {
    if (!address.house || !address.street || !address.city || !address.phone) {
      alert("Please fill all required fields before saving.");
      return;
    }

    if (!user) {
      alert("Please sign in to save addresses");
      navigate("/login");
      return;
    }

    try {
      const newAddress = {
        ...address,
        userId: user.uid,
        coordinates: location,
        createdAt: new Date().toISOString(),
        fullAddress: `${address.house}, ${address.street}, ${address.city}`,
      };

      const docRef = await addDoc(collection(db, "addresses"), newAddress);
      setSavedAddresses([...savedAddresses, { id: docRef.id, ...newAddress }]);

      setAddress({
        name: "",
        house: "",
        street: "",
        city: "",
        phone: "",
        type: "Home",
      });
    } catch (err) {
      console.error("Error saving address:", err);
      alert("Failed to save address. Please try again.");
    }
  };

  const handleDeleteAddress = async (id) => {
    if (window.confirm("Are you sure you want to delete this address?")) {
      try {
        await deleteDoc(doc(db, "addresses", id));
        setSavedAddresses(savedAddresses.filter((addr) => addr.id !== id));
      } catch (err) {
        console.error("Error deleting address:", err);
        alert("Failed to delete address");
      }
    }
  };

  const handleUseAddress = (addr) => {
    localStorage.setItem(
      "selectedLocation",
      JSON.stringify({
        coordinates: addr.coordinates,
        address: addr.fullAddress,
        name: addr.name || addr.type,
      })
    );
    navigate("/");
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyD6oR6e-7GCylEFsGhv5LZqQMB27N28j38">
      <div className="location-page">
        <div className="location-header">
          <h1>Your Addresses</h1>
          <p>Manage your delivery locations</p>
        </div>

        <div className="location-content">
          <div className="map-container">
            {error ? (
              <div className="map-error">{error}</div>
            ) : location ? (
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={location}
                zoom={15}
                options={{
                  streetViewControl: false,
                  mapTypeControl: false,
                  fullscreenControl: false,
                }}
              >
                <Marker
                  position={location}
                  icon={{
                    url: "https://maps.google.com/mapfiles/ms/icons/red-dot.png",
                  }}
                />
              </GoogleMap>
            ) : (
              <div className="map-loading">Loading map...</div>
            )}
          </div>

          <div className="address-management">
            <div className="address-form-container">
              <h2>Add New Address</h2>
              <div className="address-form">
                <div className="form-group">
                  <label>Address Type</label>
                  <select
                    value={address.type}
                    onChange={(e) =>
                      setAddress({ ...address, type: e.target.value })
                    }
                  >
                    <option value="Home">Home</option>
                    <option value="Work">Work</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Name (Optional)</label>
                  <input
                    type="text"
                    placeholder="E.g. My Home"
                    value={address.name}
                    onChange={(e) =>
                      setAddress({ ...address, name: e.target.value })
                    }
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>House/Flat No.*</label>
                    <input
                      type="text"
                      placeholder="House/Apartment number"
                      value={address.house}
                      onChange={(e) =>
                        setAddress({ ...address, house: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label>Street*</label>
                    <input
                      type="text"
                      placeholder="Street name"
                      value={address.street}
                      onChange={(e) =>
                        setAddress({ ...address, street: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>City*</label>
                  <input
                    type="text"
                    placeholder="City"
                    value={address.city}
                    onChange={(e) =>
                      setAddress({ ...address, city: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Phone Number*</label>
                  <input
                    type="tel"
                    placeholder="10-digit mobile number"
                    value={address.phone}
                    onChange={(e) =>
                      setAddress({ ...address, phone: e.target.value })
                    }
                    required
                  />
                </div>

                <button onClick={handleSaveAddress} className="save-btn">
                  Save Address
                </button>
              </div>
            </div>

            <div className="saved-addresses-container">
              <h2>Saved Addresses</h2>
              {loading ? (
                <div className="loading-message">Loading your addresses...</div>
              ) : savedAddresses.length === 0 ? (
                <div className="empty-message">
                  <p>No saved addresses yet</p>
                  <p>Add an address to see it here</p>
                </div>
              ) : (
                <div className="address-list">
                  {savedAddresses.map((addr) => (
                    <div key={addr.id} className="address-card">
                      <div className="address-card-header">
                        <span className="address-type">{addr.type}</span>
                        <h3>{addr.name || addr.type}</h3>
                      </div>
                      <div className="address-details">
                        <p>{addr.fullAddress}</p>
                        <p>Phone: {addr.phone}</p>
                      </div>
                      <div className="address-actions">
                        <button
                          onClick={() => handleUseAddress(addr)}
                          className="use-btn"
                        >
                          Use This Address
                        </button>
                        <button
                          onClick={() => handleDeleteAddress(addr.id)}
                          className="delete-btn"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <button onClick={() => navigate("/")} className="back-btn">
          Back to Home
        </button>
      </div>
    </LoadScript>
  );
}

export default Location;
