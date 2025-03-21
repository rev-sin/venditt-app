import { useEffect, useState } from "react";
import { GoogleMap, LoadScript, Marker } from "@react-google-maps/api";
import { useNavigate } from "react-router-dom";
import "../styles/Location.css";

const containerStyle = {
  width: "100%",
  height: "100%",
};

function Location() {
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const [address, setAddress] = useState({ name: "", house: "", street: "", phone: "", type: "Home" });
  const [savedAddresses, setSavedAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          console.log("User Location:", newLocation);
          setLocation(newLocation);
          localStorage.setItem("selectedLocation", JSON.stringify(newLocation));
        },
        (error) => {
          console.error("Geolocation Error:", error);
          setError("Unable to retrieve location");
        }
      );
    } else {
      console.error("Geolocation not supported by this browser");
      setError("Geolocation is not supported by this browser");
    }
  }, []);

  const handleSaveAddress = () => {
    if (!address.house || !address.street || !address.phone) {
      alert("Please fill all fields before saving.");
      return;
    }
    const newAddress = { ...address };
    setSavedAddresses([...savedAddresses, newAddress]);
    localStorage.setItem("savedAddresses", JSON.stringify([...savedAddresses, newAddress]));
    setAddress({ name: "", house: "", street: "", phone: "", type: "Home" });
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyD6oR6e-7GCylEFsGhv5LZqQMB27N28j38">
      <div className="location-page">
        <div className="top-bar">
          <input type="text" placeholder="Search for a location..." className="search-bar" />
          <div className="saved-addresses">
            {savedAddresses.map((addr, index) => (
              <div key={index} className="saved-address">{addr.name || addr.type}</div>
            ))}
          </div>
        </div>
        <div className="location-container">
          <div className="map-section">
            {error ? (
              <p>{error}</p>
            ) : location ? (
              <GoogleMap mapContainerStyle={containerStyle} center={location} zoom={15}>
                <Marker position={location} />
              </GoogleMap>
            ) : (
              <p>Loading map...</p>
            )}
          </div>
          <div className="address-form">
            <h3>Enter Address Details</h3>
            <input type="text" placeholder="Name" value={address.name} onChange={(e) => setAddress({ ...address, name: e.target.value })} />
            <input type="text" placeholder="House No." value={address.house} onChange={(e) => setAddress({ ...address, house: e.target.value })} />
            <input type="text" placeholder="Street" value={address.street} onChange={(e) => setAddress({ ...address, street: e.target.value })} />
            <input type="text" placeholder="Phone No." value={address.phone} onChange={(e) => setAddress({ ...address, phone: e.target.value })} />
            <select value={address.type} onChange={(e) => setAddress({ ...address, type: e.target.value })}>
              <option value="Home">Home</option>
              <option value="Work">Work</option>
              <option value="Other">Other</option>
            </select>
            {address.type === "Other" && (
              <input type="text" placeholder="Custom Label" onChange={(e) => setAddress({ ...address, type: e.target.value })} />
            )}
            <button onClick={handleSaveAddress}>Save Address</button>
            <button onClick={() => navigate("/")}>Back to Home</button>
          </div>
        </div>
      </div>
    </LoadScript>
  );
}

export default Location;
