import React, { useState, useEffect, useRef } from "react";
import { GoogleMap, LoadScript, Marker, DirectionsService, DirectionsRenderer, Autocomplete } from "@react-google-maps/api";
import "../styles/LocateVending.css";

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

const vendingMachines = [
  { id: 1, lat: 12.9716, lng: 77.5946 }, // Example locations
  { id: 2, lat: 12.965, lng: 77.595 },
  { id: 3, lat: 12.960, lng: 77.598 },
];

function LocateVending() {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [mapCenter, setMapCenter] = useState({ lat: 12.9716, lng: 77.5946 });
  const [nearestMachines, setNearestMachines] = useState([]);
  const [directions, setDirections] = useState(null);
  const autocompleteRef = useRef(null);

  const handleSearch = () => {
    const place = autocompleteRef.current.getPlace();
    if (!place || !place.geometry) {
      alert("Please select a valid location from the suggestions.");
      return;
    }

    const lat = place.geometry.location.lat();
    const lng = place.geometry.location.lng();
    setSelectedLocation({ lat, lng });
    setMapCenter({ lat, lng });

    const filteredMachines = vendingMachines.filter((machine) => {
      const distance = getDistance(lat, lng, machine.lat, machine.lng);
      return distance <= 3;
    });

    if (filteredMachines.length === 0) {
      alert("We are not serviceable in your location at the moment, we will be here soon.");
    }

    setNearestMachines(filteredMachines);
  };

  const getDistance = (lat1, lng1, lat2, lng2) => {
    const R = 6371; // Earth radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLng = (lng2 - lng1) * (Math.PI / 180);
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
              Math.sin(dLng / 2) * Math.sin(dLng / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyD6oR6e-7GCylEFsGhv5LZqQMB27N28j38" libraries={["places"]}>
      <div className="locate-container">
        <h2>Locate Vending Machines</h2>
        <Autocomplete onLoad={(autocomplete) => (autocompleteRef.current = autocomplete)} onPlaceChanged={handleSearch}>
          <input type="text" placeholder="Search location..." className="search-box" />
        </Autocomplete>
        <GoogleMap mapContainerStyle={mapContainerStyle} center={mapCenter} zoom={14}>
          {selectedLocation && <Marker position={selectedLocation} label="You" />}
          {nearestMachines.map((machine) => (
            <Marker key={machine.id} position={{ lat: machine.lat, lng: machine.lng }} label="V" />
          ))}
        </GoogleMap>
      </div>
    </LoadScript>
  );
}

export default LocateVending;
