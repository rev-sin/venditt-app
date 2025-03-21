import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import vendittLogo from "../assets/venditt-logo.png";
import "../styles/ProfilePage.css";

const ProfilePage = () => {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [newName, setNewName] = useState("");
  const [activeTab, setActiveTab] = useState("Reviews");
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        navigate("/login");
      } else {
        const userDoc = await getDoc(doc(db, "users", user.uid));
        if (userDoc.exists()) {
          setUser({ uid: user.uid, ...userDoc.data() });
          setNewName(userDoc.data().name);
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/login");
  };

  const handleProfileUpdate = async () => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);
    await updateDoc(userRef, { name: newName });

    setEditMode(false);
  };

  return (
    <div className="profile-container">
      {/* Profile Header */}
      <div className="profile-header">
        <img src={vendittLogo} alt="Venditt Logo" className="background-logo" />
        <div className="profile-info">
          <img src="/default-avatar.png" alt="Profile" className="profile-pic" />
          {editMode ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="edit-name-input"
            />
          ) : (
            <h2 className="profile-name">{user?.name || "User"}</h2>
          )}
          {editMode ? (
            <button className="save-profile-btn" onClick={handleProfileUpdate}>
              Save
            </button>
          ) : (
            <button className="edit-profile-btn" onClick={() => setEditMode(true)}>
              Edit profile
            </button>
          )}
        </div>
        <div className="profile-stats">
          <div>
            <p>0</p>
            <span>Reviews</span>
          </div>
          <div>
            <p>0</p>
            <span>Photos</span>
          </div>
          <div>
            <p>0</p>
            <span>Followers</span>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="profile-content">
        {/* Sidebar */}
        <div className="sidebar">
          <h4>Activity</h4>
          <ul>
            <li className={activeTab === "Reviews" ? "active" : ""} onClick={() => setActiveTab("Reviews")}>
              Reviews
            </li>
            <li className={activeTab === "Photos" ? "active" : ""} onClick={() => setActiveTab("Photos")}>
              Photos
            </li>
            <li className={activeTab === "Followers" ? "active" : ""} onClick={() => setActiveTab("Followers")}>
              Followers
            </li>
            <li className={activeTab === "Recently Viewed" ? "active" : ""} onClick={() => setActiveTab("Recently Viewed")}>
              Recently Viewed
            </li>
          </ul>

          <h4>Online Ordering</h4>
          <ul>
            <li>My addresses</li>
          </ul>

          <h4>Payments</h4>
          <ul>
            <li>Manage Cards</li>
          </ul>

          <h4>Table Booking</h4>
          <ul>
            <li>Your Bookings</li>
          </ul>

          <h4>Account Settings</h4>
          <ul>
            <li>Delete Account</li>
          </ul>
        </div>

        {/* Main Section */}
        <div className="profile-details">
          <h2 className="section-title">{activeTab}</h2>
          <div className="empty-state">
            <img src="/empty-state.png" alt="Empty" />
            <p>Nothing here yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
