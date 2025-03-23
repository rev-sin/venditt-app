import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
      } else {
        setUserId("");
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return;
      const cartRef = doc(db, "carts", userId);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        setCartItems(cartSnap.data().items);
      }
    };

    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const handleQuantityChange = async (productId, quantity) => {
    const updatedItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: quantity } : item
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    });
  };

  const removeFromCart = async (productId) => {
    const updatedItems = cartItems.filter(
      (item) => item.productId !== productId
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
      ),
    });
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">My Cart</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {cartItems.map((item) => (
          <div
            key={item.productId}
            className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
          >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-48 object-cover mb-4 rounded"
            />
            <h2 className="text-xl font-semibold mb-2">{item.name}</h2>
            <p className="text-gray-700 mb-1">Price: &#8377;{item.price}</p>
            <div className="flex items-center mb-2">
              <button
                className="bg-gray-300 text-gray-700 px-2 py-1 rounded-l"
                onClick={() =>
                  handleQuantityChange(
                    item.productId,
                    Math.max(item.quantity - 1, 1)
                  )
                }
                disabled={item.quantity <= 1}
              >
                -
              </button>
              <input
                type="text"
                className="w-12 text-center border-t border-b border-gray-300"
                value={item.quantity}
                onChange={(e) =>
                  handleQuantityChange(
                    item.productId,
                    parseInt(e.target.value) || 1
                  )
                }
              />
              <button
                className="bg-gray-300 text-gray-700 px-2 py-1 rounded-r"
                onClick={() =>
                  handleQuantityChange(item.productId, item.quantity + 1)
                }
              >
                +
              </button>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-600 transition-colors duration-300"
                onClick={() => removeFromCart(item.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Cart;
