import { useEffect, useState } from "react";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [suggestedItems, setSuggestedItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const navigate = useNavigate();

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
        setCartItems(cartSnap.data().items || []);
      }
      setLoading(false);
    };

    const fetchSuggestedItems = async () => {
      const productsRef = collection(db, "products");
      const productsSnap = await getDocs(productsRef);
      if (!productsSnap.empty) {
        const productList = productsSnap.docs.map((doc) => ({
          productId: doc.id,
          ...doc.data(),
        }));
        setSuggestedItems(productList.slice(0, 5)); // Fetch only 5 items
      }
    };

    if (userId) {
      fetchCartItems();
      fetchSuggestedItems();
    }
  }, [userId]);

  const handleQuantityChange = async (productId, quantity) => {
    if (quantity < 1) {
      removeFromCart(productId);
      return;
    }

    const updatedItems = cartItems.map((product) =>
      product.productId === productId ? { ...product, quantity } : product
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, { items: updatedItems });
  };

  const removeFromCart = async (productId) => {
    const updatedItems = cartItems.filter(
      (product) => product.productId !== productId
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, { items: updatedItems });
  };

  const addToCart = async (product) => {
    const existingItem = cartItems.find(
      (item) => item.productId === product.productId
    );
    let updatedItems;

    if (existingItem) {
      updatedItems = cartItems.map((item) =>
        item.productId === product.productId
          ? { ...item, quantity: item.quantity + 1 }
          : item
      );
    } else {
      updatedItems = [...cartItems, { ...product, quantity: 1 }];
    }

    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, { items: updatedItems });
  };

  const applyCoupon = () => {
    if (coupon === "DISCOUNT10") {
      setDiscount(0.1);
    } else {
      setDiscount(0);
      alert("Invalid coupon code");
    }
  };

  const totalPrice = cartItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const discountedPrice = totalPrice * (1 - discount);
  const platformFee = 8;
  const finalAmount = discountedPrice + platformFee;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {/* Cart Items Section */}
      <div className="border p-4 rounded-lg shadow-md mb-6">
        {loading ? (
          <p>Loading...</p>
        ) : cartItems.length === 0 ? (
          <p className="text-gray-500 text-center">Your cart is empty.</p>
        ) : (
          cartItems.map((product) => (
            <div
              key={product.productId}
              className="flex items-center justify-between py-4 border-b"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-24 rounded shadow object-cover"
              />
              <div className="flex-1 px-4">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">₹{product.price}</p>
              </div>
              <div className="flex items-center">
                <button
                  className="bg-gray-300 px-2 py-1 rounded-l text-lg"
                  onClick={() =>
                    handleQuantityChange(
                      product.productId,
                      product.quantity - 1
                    )
                  }
                >
                  -
                </button>
                <input
                  type="text"
                  className="w-12 text-center border-t border-b text-lg"
                  value={product.quantity}
                  readOnly
                />
                <button
                  className="bg-gray-300 px-2 py-1 rounded-r text-lg"
                  onClick={() =>
                    handleQuantityChange(
                      product.productId,
                      product.quantity + 1
                    )
                  }
                >
                  +
                </button>
              </div>
            </div>
          ))
        )}
      </div>
      {/* Coupon Section */}
      <div className="border p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold">Apply Coupon</h2>
        <div className="flex items-center mt-2">
          <input
            className="border p-2 rounded w-1/3"
            placeholder="Enter coupon code"
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
          />
          <button
            className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
            onClick={applyCoupon}
          >
            Apply
          </button>
        </div>
      </div>
      {/* Suggested Items Section */}
      <div className="border p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold mb-2">You Might Also Like</h2>
        <div className="grid grid-cols-5 gap-4">
          {suggestedItems.map((item) => {
            const inCart = cartItems.find(
              (cartItem) => cartItem.productId === item.productId
            );
            return (
              <div
                key={item.productId}
                className="border p-3 rounded-lg shadow-md flex flex-col items-center"
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-32 h-32 object-cover rounded"
                />
                <h3 className="text-sm font-semibold mt-2">{item.name}</h3>
                <p className="text-gray-600">₹{item.price}</p>
                {inCart ? (
                  <div className="flex mt-2">
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          inCart.quantity - 1
                        )
                      }
                    >
                      -
                    </button>
                    <span className="px-4">{inCart.quantity}</span>
                    <button
                      onClick={() =>
                        handleQuantityChange(
                          item.productId,
                          inCart.quantity + 1
                        )
                      }
                    >
                      +
                    </button>
                  </div>
                ) : (
                  <button onClick={() => addToCart(item)}>Add to Cart</button>
                )}
              </div>
            );
          })}
        </div>
      </div>
      {/* Order Summary (Again Before Payment) */}
      <div className="border p-4 rounded-lg shadow-md mb-6">
        <h2 className="text-lg font-bold mb-2">Final Order Summary</h2>
        <p>Subtotal: ₹{totalPrice.toFixed(2)}</p>
        <p>Discount: ₹{(totalPrice * discount).toFixed(2)}</p>
        <p>Platform Fee: ₹{platformFee.toFixed(2)}</p>
        <p className="font-bold">Total Payable: ₹{finalAmount.toFixed(2)}</p>
      </div>
      {/* Proceed to Payment Button */}
      <button
        onClick={() => navigate("/payment")}
        className="bg-green-500 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-600 transition-all mb-12"
      >
        Proceed to Payment
      </button>
    </div>
  );
};

export default Cart;
