import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import ProductPage from "./pages/ProductPage";
import LocateVending from "./pages/LocateVending";
import OffersRewards from "./pages/OffersRewards";
import RecentHistory from "./pages/RecentHistory";
import ProfilePage from "./pages/ProfilePage";
import Location from "./pages/Location";
import Navbar from "./components/Navbar";
import BottomNav from "./components/BottomNav";
import { CartProvider } from "./context/CartContext";
import Cart from "./pages/Cart";
import Payment from "./pages/Payment";
import ForgotPassword from "./pages/ForgotPassword";
import "./App.css";

function App() {
  return (
    <CartProvider>  {/* ✅ Wrap CartProvider correctly */}
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/products" element={<ProductPage />} />
        <Route path="/locate" element={<LocateVending />} />
        <Route path="/offers" element={<OffersRewards />} />
        <Route path="/history" element={<RecentHistory />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/location" element={<Location />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
      </Routes>
      <BottomNav />
    </CartProvider>
  );
}

export default App;
