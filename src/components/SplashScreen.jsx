import { useEffect, useState } from "react";
import logo from "/src/assets/venditt-logo.png";
import "../styles/SplashScreen.css";

function SplashScreen() {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    setTimeout(() => {
      setFadeOut(true);
    }, 2500);
  }, []);

  return (
    <div className={`splash-screen ${fadeOut ? "fade-out" : ""}`}>
      <img src={logo} alt="Venditt Logo" />
    </div>
  );
}

export default SplashScreen;
