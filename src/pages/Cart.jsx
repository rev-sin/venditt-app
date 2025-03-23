import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";

const Skeleton = () => (
  <div className="animate-pulse flex space-x-4">
    <div className="rounded bg-gray-300 h-24 w-24"></div>
    <div className="flex-1 space-y-4 py-1">
      <div className="h-4 bg-gray-300 rounded w-3/4"></div>
      <div className="space-y-2">
        <div className="h-4 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-5/6"></div>
      </div>
    </div>
  </div>
);

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);

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
        const cartData = cartSnap.data().items;
        const updatedCartItems = await Promise.all(
          cartData.map(async (item) => {
            const productRef = doc(db, "products", item.productId);
            const productSnap = await getDoc(productRef);
            if (productSnap.exists()) {
              return { ...item, ...productSnap.data() };
            }
            return item;
          })
        );
        setCartItems(updatedCartItems);
      }
      setLoading(false);
    };
    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  const handleQuantityChange = async (productId, quantity) => {
    const updatedItems = cartItems.map((product) =>
      product.productId === productId ? { ...product, quantity } : product
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      ),
    });
  };

  const removeFromCart = async (productId) => {
    const updatedItems = cartItems.filter(
      (product) => product.productId !== productId
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: updatedItems,
      totalPrice: updatedItems.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      ),
    });
  };

  const applyCoupon = () => {
    // Example coupon logic
    if (coupon === "DISCOUNT10") {
      setDiscount(0.1); // 10% discount
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

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Shopping Cart</h1>
      {loading ? (
        <div className="space-y-4">
          <Skeleton />
          <Skeleton />
          <Skeleton />
        </div>
      ) : cartItems.length === 0 ? (
        <p className="text-gray-500">Your cart is empty.</p>
      ) : (
        <div className="p-4 rounded-lg">
          {cartItems.map((product) => (
            <div
              key={product.productId}
              className=" border flex items-center py-4 gap-4"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-24 h-24 rounded"
              />
              <div className="flex-1">
                <h2 className="text-lg font-semibold">{product.name}</h2>
                <p className="text-gray-600">Price: ₹{product.price}</p>
                <p className="text-green-600">In stock</p>
                <div className="flex items-center mt-2">
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded-l"
                    onClick={() =>
                      handleQuantityChange(
                        product.productId,
                        Math.max(product.quantity - 1, 1)
                      )
                    }
                    disabled={product.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="w-12 text-center border-t border-b border-gray-300"
                    value={product.quantity}
                    onChange={(e) =>
                      handleQuantityChange(
                        product.productId,
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded-r"
                    onClick={() =>
                      handleQuantityChange(
                        product.productId,
                        product.quantity + 1
                      )
                    }
                  >
                    +
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded ml-4 hover:bg-red-600 transition"
                    onClick={() => removeFromCart(product.productId)}
                  >
                    Delete
                  </button>
                </div>
              </div>
              <p className="text-lg font-semibold">
                ₹{product.price * product.quantity}
              </p>
            </div>
          ))}
          <div className="mt-4">
            <select
              className="border p-2 rounded"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
            >
              <option value="">Select a coupon</option>
              <option value="DISCOUNT10">DISCOUNT10 - 10% off</option>
              {/* Add more coupon options here */}
            </select>
            <button
              className="bg-blue-500 text-white px-4 py-2 rounded ml-2 hover:bg-blue-600 transition"
              onClick={applyCoupon}
            >
              Apply Coupon
            </button>
          </div>
          <div className="text-right mt-4 text-lg font-bold">
            Subtotal ({cartItems.length} product
            {cartItems.length > 1 ? "s" : ""}): ₹{totalPrice}
          </div>
          {discount > 0 && (
            <div className="text-right mt-2 text-lg font-bold text-green-600">
              Discount: -₹{totalPrice * discount}
            </div>
          )}
          <div className="text-right mt-2 text-lg font-bold">
            Total: ₹{discountedPrice}
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
