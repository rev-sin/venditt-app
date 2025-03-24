import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import vendittLogo from "../assets/venditt-logo.png";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState("Settings");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            setUser({ uid: user.uid, ...userDoc.data() });
            setNewName(userDoc.data().name);
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        } finally {
          setLoading(false);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleProfileUpdate = async () => {
    if (!user) return;

    try {
      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, { name: newName });
      setEditMode(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="profile-container">
        {/* Skeleton Loading */}
        <div className="skeleton-header"></div>

        <div className="profile-content">
          <div className="skeleton-sidebar"></div>
          <div className="skeleton-main"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <div className="profile-logo-container">
          <img src={vendittLogo} alt="Venditt Logo" className="profile-logo" />
        </div>

        <div className="profile-info">
          <div className="profile-avatar-container">
            <div className="profile-avatar">
              <span className="avatar-icon">👤</span>
            </div>

            <div className="profile-name-container">
              {editMode ? (
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="profile-name-input"
                  placeholder="Enter your name"
                />
              ) : (
                <h2 className="profile-name">{user?.name || "User"}</h2>
              )}

              {editMode ? (
                <div className="profile-actions">
                  <button
                    className="profile-save-btn"
                    onClick={handleProfileUpdate}
                  >
                    Save
                  </button>
                  <button
                    className="profile-cancel-btn"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  className="profile-edit-btn"
                  onClick={() => setEditMode(true)}
                >
                  Edit Profile
                </button>
              )}
            </div>
          </div>

          <div className="profile-stats">
            <div className="stat-item">
              <p className="stat-number">0</p>
              <span className="stat-label">Reviews</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <span className="sidebar-icon">⚙️</span>
              Settings
            </h4>
            <ul className="sidebar-menu">
              <li
                className={`sidebar-item ${
                  activeTab === "Settings" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Settings")}
              >
                Account Settings
              </li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <span className="sidebar-icon">📍</span>
              Locations
            </h4>
            <ul className="sidebar-menu">
              <Link to="/location" className="sidebar-link">
                <li className="sidebar-item">My Addresses</li>
              </Link>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <span className="sidebar-icon">💳</span>
              Payments
            </h4>
            <ul className="sidebar-menu">
              <li className="sidebar-item">Manage Cards</li>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <span className="sidebar-icon">📦</span>
              Orders
            </h4>
            <ul className="sidebar-menu">
              <Link to="/orders" className="sidebar-link">
                <li className="sidebar-item">Your Bookings</li>
              </Link>
            </ul>
          </div>

          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <span className="sidebar-icon">❌</span>
              Account
            </h4>
            <ul className="sidebar-menu">
              <li className="sidebar-item danger">Delete Account</li>
            </ul>
          </div>

          {/* New Customer Support Section */}
          <div className="sidebar-section">
            <h4 className="sidebar-title">
              <span className="sidebar-icon">🛟</span>
              Support
            </h4>
            <ul className="sidebar-menu">
              <li
                className={`sidebar-item ${
                  activeTab === "Support" ? "active" : ""
                }`}
                onClick={() => setActiveTab("Support")}
              >
                Contact Support
              </li>
              <li className="sidebar-item">FAQs</li>
            </ul>
          </div>
        </div>

        {/* Main Section */}
        <div className="profile-main">
          <h2 className="main-title">{activeTab}</h2>

          {activeTab === "Settings" && (
            <div className="settings-content">
              <div className="empty-state">
                <span className="empty-icon">⚙️</span>
                <p className="empty-text">Account settings will appear here</p>
              </div>
            </div>
          )}

          {activeTab === "Support" && (
            <div className="support-content">
              <div className="support-card">
                <h3>Contact Our Support Team</h3>
                <p>Email us at: support@venditt.com</p>
                <p>Call us: +1 (800) 123-4567</p>
                <button className="support-button">Live Chat</button>
              </div>

              <div className="faq-section">
                <h3>Frequently Asked Questions</h3>
                <div className="faq-item">
                  <h4>How do I change my password?</h4>
                  <p>Go to Account Settings and select 'Change Password'.</p>
                </div>
                <div className="faq-item">
                  <h4>What's your return policy?</h4>
                  <p>We accept returns within 30 days of purchase.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Gap */}
      <div className="bottom-gap"></div>
    </div>
  );
};

export default ProfilePage;
