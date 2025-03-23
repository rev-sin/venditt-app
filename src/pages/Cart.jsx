import { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import {
  collection,
  getDocs,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const Cart = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState("");
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const user = querySnapshot.docs[0]; // Replace with logic to get the correct user
        if (user) {
          setUserId(user.id);
        }

        const productSnapshot = await getDocs(collection(db, "products"));
        const items = productSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setProducts(items);

        if (user) {
          const cartRef = doc(db, "carts", user.id);
          const cartSnap = await getDoc(cartRef);
          if (cartSnap.exists()) {
            const cartData = cartSnap.data();
            const quantities = {};
            cartData.items.forEach((item) => {
              quantities[item.productId] = item.quantity;
            });
            setQuantities(quantities);
            setCartItems(cartData.items);
          }
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching data: ", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleQuantityChange = async (productId, quantity) => {
    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));

    if (!userId) {
      console.error("User ID not found");
      return;
    }

    const cartRef = doc(db, "carts", userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const existingItems = cartSnap.data().items || [];
      const updatedItems = existingItems.map((item) =>
        item.productId === productId ? { ...item, quantity: quantity } : item
      );
      await updateDoc(cartRef, {
        items: updatedItems,
        totalPrice: updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      });
    }
  };

  const handleRemoveFromCart = async (productId) => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    const cartRef = doc(db, "carts", userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const existingItems = cartSnap.data().items || [];
      const updatedItems = existingItems.filter(
        (item) => item.productId !== productId
      );
      await updateDoc(cartRef, {
        items: updatedItems,
        totalPrice: updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
      });
      setCartItems(updatedItems);
      setQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        delete newQuantities[productId];
        return newQuantities;
      });
    }
  };

  const totalPrice = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">Cart</h1>
      <ul className="list-none p-0">
        {cartItems.map((cartItem) => {
          const product = products.find((p) => p.id === cartItem.productId);
          return (
            <li
              key={cartItem.productId}
              className="border rounded-lg p-4 shadow-lg mb-4 bg-white"
            >
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-1">
                Description: {product.description}
              </p>
              <p className="text-gray-700 mb-1">Price: ${product.price}</p>
              <p className="text-gray-700 mb-1">Stock: {product.stock}</p>
              <p className="text-gray-700 mb-1">
                Available: {product.isAvailable ? "Yes" : "No"}
              </p>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-auto mt-2 rounded"
              />
              <div className="flex items-center mb-2">
                <button
                  className="bg-gray-300 text-gray-700 px-2 py-1 rounded-l hover:bg-gray-400"
                  onClick={() =>
                    handleQuantityChange(
                      cartItem.productId,
                      Math.max((quantities[cartItem.productId] || 1) - 1, 1)
                    )
                  }
                  disabled={quantities[cartItem.productId] <= 1}
                >
                  -
                </button>
                <input
                  type="text"
                  className="w-12 text-center border-t border-b border-gray-300"
                  value={quantities[cartItem.productId] || 1}
                  onChange={(e) =>
                    handleQuantityChange(
                      cartItem.productId,
                      parseInt(e.target.value) || 1
                    )
                  }
                />
                <button
                  className="bg-gray-300 text-gray-700 px-2 py-1 rounded-r hover:bg-gray-400"
                  onClick={() =>
                    handleQuantityChange(
                      cartItem.productId,
                      (quantities[cartItem.productId] || 1) + 1
                    )
                  }
                >
                  +
                </button>
              </div>
              <button
                className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                onClick={() => handleRemoveFromCart(cartItem.productId)}
              >
                Remove from Cart
              </button>
            </li>
          );
        })}
      </ul>
      <h2 className="text-2xl font-bold mt-4">Total Price: ${totalPrice}</h2>
    </div>
  );
};

export default Cart;
