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
    <div className="container mx-auto p-6">
      {/* Profile Header */}
      <div className="bg-white shadow-lg rounded-lg p-8 mb-8">
        <img
          src={vendittLogo}
          alt="Venditt Logo"
          className="w-24 mx-auto mb-6"
        />
        <div className="flex items-center justify-between mb-6">
          <img
            src="/default-avatar.png"
            alt="Profile"
            className="w-20 h-20 rounded-full"
          />
          {editMode ? (
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="border p-2 rounded w-full ml-4"
            />
          ) : (
            <h2 className="text-2xl font-semibold ml-4">
              {user?.name || "User"}
            </h2>
          )}
          {editMode ? (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded ml-4"
              onClick={handleProfileUpdate}
            >
              Save
            </button>
          ) : (
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded ml-4"
              onClick={() => setEditMode(true)}
            >
              Edit profile
            </button>
          )}
        </div>
        <div className="flex justify-around">
          <div className="text-center">
            <p className="text-xl font-semibold">0</p>
            <span>Reviews</span>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">0</p>
            <span>Photos</span>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold">0</p>
            <span>Followers</span>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="flex">
        {/* Sidebar */}
        <div className="w-1/4 bg-white shadow-lg rounded-lg p-6">
          <h4 className="font-semibold mb-4">Activity</h4>
          <ul>
            <li
              className={`cursor-pointer p-2 rounded ${
                activeTab === "Reviews" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("Reviews")}
            >
              Reviews
            </li>
            <li
              className={`cursor-pointer p-2 rounded ${
                activeTab === "Photos" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("Photos")}
            >
              Photos
            </li>
            <li
              className={`cursor-pointer p-2 rounded ${
                activeTab === "Followers" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("Followers")}
            >
              Followers
            </li>
            <li
              className={`cursor-pointer p-2 rounded ${
                activeTab === "Recently Viewed" ? "bg-blue-600 text-white" : ""
              }`}
              onClick={() => setActiveTab("Recently Viewed")}
            >
              Recently Viewed
            </li>
          </ul>

          <h4 className="font-semibold mt-6 mb-4">Online Ordering</h4>
          <ul>
            <li className="cursor-pointer p-2 rounded">My addresses</li>
          </ul>

          <h4 className="font-semibold mt-6 mb-4">Payments</h4>
          <ul>
            <li className="cursor-pointer p-2 rounded">Manage Cards</li>
          </ul>

          <h4 className="font-semibold mt-6 mb-4">Table Booking</h4>
          <ul>
            <li className="cursor-pointer p-2 rounded">Your Bookings</li>
          </ul>

          <h4 className="font-semibold mt-6 mb-4">Account Settings</h4>
          <ul>
            <li className="cursor-pointer p-2 rounded">Delete Account</li>
          </ul>
        </div>

        {/* Main Section */}
        <div className="w-3/4 bg-white shadow-lg rounded-lg p-8 ml-6">
          <h2 className="text-2xl font-semibold mb-6">{activeTab}</h2>
          <div className="flex flex-col items-center justify-center h-full">
            <img src="/empty-state.png" alt="Empty" className="w-32 mb-6" />
            <p className="text-gray-500">Nothing here yet</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
