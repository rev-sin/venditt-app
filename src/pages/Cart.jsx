import { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, addDoc, collection } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const [cartItems, setCartItems] = useState([]);
  const [userId, setUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [coupon, setCoupon] = useState("");
  const [discount, setDiscount] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCoupons, setShowCoupons] = useState(false);
  const [couponError, setCouponError] = useState("");
  const navigate = useNavigate();

  const availableCoupons = [
    { code: "SAVE50", discount: 50 },
    { code: "DISCOUNT100", discount: 100 },
    { code: "BIGSALE150", discount: 150 },
    { code: "KARTHIK", discount: 150 },
  ];

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

  const applyCoupon = () => {
    setCouponError("");
    const appliedCoupon = availableCoupons.find(
      (c) => c.code.toUpperCase() === coupon.toUpperCase()
    );

    if (!appliedCoupon) {
      setCouponError("Invalid coupon code");
      return;
    }

    const totalPrice = cartItems.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );

    if (appliedCoupon.discount > totalPrice) {
      setCouponError("Coupon value cannot exceed cart total");
      return;
    }

    setDiscount(appliedCoupon.discount);
    setSelectedCoupon(appliedCoupon.code);
  };

  const removeCoupon = () => {
    setDiscount(0);
    setSelectedCoupon(null);
    setCoupon("");
    setCouponError("");
  };

  const selectCoupon = (code, discountAmount) => {
    setCouponError("");
    const totalPrice = cartItems.reduce(
      (total, product) => total + product.price * product.quantity,
      0
    );

    if (discountAmount > totalPrice) {
      setCouponError("Coupon value cannot exceed cart total");
      return;
    }

    setCoupon(code);
    setDiscount(discountAmount);
    setSelectedCoupon(code);
    setShowCoupons(false);
  };

  const updateCartItem = async (productId, newQuantity) => {
    if (newQuantity < 1) {
      removeItemFromCart(productId);
      return;
    }

    const updatedItems = cartItems.map((item) =>
      item.productId === productId ? { ...item, quantity: newQuantity } : item
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: updatedItems.map(({ productId, quantity }) => ({
        productId,
        quantity,
      })),
    });

    // Check if current discount is still valid after quantity change
    if (selectedCoupon) {
      const totalPrice = updatedItems.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      );
      if (discount > totalPrice) {
        setCouponError("Coupon no longer valid - removed");
        removeCoupon();
      }
    }
  };

  const removeItemFromCart = async (productId) => {
    const updatedItems = cartItems.filter(
      (item) => item.productId !== productId
    );
    setCartItems(updatedItems);

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: updatedItems.map(({ productId, quantity }) => ({
        productId,
        quantity,
      })),
    });

    // Check if current discount is still valid after item removal
    if (selectedCoupon) {
      const totalPrice = updatedItems.reduce(
        (total, product) => total + product.price * product.quantity,
        0
      );
      if (discount > totalPrice) {
        setCouponError("Coupon no longer valid - removed");
        removeCoupon();
      }
    }
  };

  const handleProceedToPayment = async () => {
    const ordersCollectionRef = collection(db, "orders");
    await addDoc(ordersCollectionRef, {
      items: cartItems,
      totalPrice,
      discount,
      finalAmount,
      createdAt: new Date(),
      userId: userId,
    });

    const cartRef = doc(db, "carts", userId);
    await updateDoc(cartRef, {
      items: [],
    });

    setCartItems([]);
    navigate("/payment");
  };

  const totalPrice = cartItems.reduce(
    (total, product) => total + product.price * product.quantity,
    0
  );

  const discountedPrice = Math.max(totalPrice - discount, 0);
  const platformFee = 8;
  const finalAmount = discountedPrice + platformFee;

  return (
    <div className="container mx-auto p-6 bg-gray-50 min-h-screen">
      <h1 className="text-4xl font-extrabold text-gray-800 mb-8 text-center">
        Shopping Cart
      </h1>

      {loading ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {/* Skeleton for cart items */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <div className="skeleton h-8 w-48 mb-6"></div>
              {[...Array(3)].map((_, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-4 border-b"
                >
                  <div className="skeleton w-20 h-20 rounded"></div>
                  <div className="flex-1 px-4">
                    <div className="skeleton h-6 w-3/4 mb-2"></div>
                    <div className="skeleton h-4 w-1/2 mb-4"></div>
                    <div className="flex items-center">
                      <div className="skeleton h-8 w-8 rounded-l"></div>
                      <div className="skeleton h-8 w-8 mx-2"></div>
                      <div className="skeleton h-8 w-8 rounded-r"></div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <div className="skeleton h-6 w-16 mb-2"></div>
                    <div className="skeleton h-4 w-12"></div>
                  </div>
                </div>
              ))}
            </div>

            {/* Skeleton for coupon section */}
            <div className="bg-white p-6 rounded-lg shadow-md mb-20">
              <div className="skeleton h-8 w-48 mb-6"></div>
              <div className="flex items-center">
                <div className="skeleton h-12 flex-grow rounded-lg"></div>
                <div className="skeleton h-12 w-24 ml-4 rounded-lg"></div>
              </div>
              <div className="skeleton h-6 w-full mt-4 rounded-lg"></div>
            </div>
          </div>

          <div>
            {/* Skeleton for bill summary */}
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="skeleton h-8 w-48 mb-6"></div>
              <div className="flex justify-between py-2">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
              <div className="flex justify-between py-2">
                <div className="skeleton h-4 w-24"></div>
                <div className="skeleton h-4 w-16"></div>
              </div>
              <div className="skeleton h-px w-full my-4"></div>
              <div className="flex justify-between">
                <div className="skeleton h-6 w-24"></div>
                <div className="skeleton h-6 w-24"></div>
              </div>
            </div>

            <div className="skeleton h-14 w-full mt-6 rounded-lg"></div>
          </div>
        </div>
      ) : cartItems.length === 0 ? (
        <div className="flex flex-col items-center">
          <img
            src="https://i.pinimg.com/736x/2e/ac/fa/2eacfa305d7715bdcd86bb4956209038.jpg"
            alt="Empty Cart"
            className="w-64 h-64 mb-6"
          />
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded-lg text-lg shadow-md hover:bg-blue-700 transition"
            onClick={() => navigate("/products")}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white p-6 rounded-lg shadow-md mb-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Your Items
              </h2>
              {cartItems.map((product) => (
                <div
                  key={product.productId}
                  className="flex items-center justify-between py-4 border-b"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-20 h-20 rounded shadow"
                  />
                  <div className="flex-1 px-4">
                    <h3 className="text-lg font-semibold text-gray-700">
                      {product.name}
                    </h3>
                    <p className="text-gray-500">₹{product.price}</p>
                    <div className="flex items-center mt-2">
                      <button
                        className="bg-gray-200 px-2 py-1 rounded-l"
                        onClick={() =>
                          updateCartItem(
                            product.productId,
                            product.quantity - 1
                          )
                        }
                      >
                        -
                      </button>
                      <span className="px-4">{product.quantity}</span>
                      <button
                        className="bg-gray-200 px-2 py-1 rounded-r"
                        onClick={() =>
                          updateCartItem(
                            product.productId,
                            product.quantity + 1
                          )
                        }
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-700 font-semibold mb-2">
                      ₹{(product.price * product.quantity).toFixed(2)}
                    </span>
                    <button
                      className="text-red-500 text-sm"
                      onClick={() => removeItemFromCart(product.productId)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-white p-6 rounded-lg shadow-md mb-20">
              {" "}
              {/* Added mb-20 for 5cm gap */}
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Apply Coupon
              </h2>
              <div className="flex items-center">
                <input
                  className="border p-3 rounded-lg w-full"
                  placeholder="Enter coupon code"
                  value={coupon}
                  onChange={(e) => {
                    setCoupon(e.target.value);
                    setCouponError("");
                  }}
                />
                <button
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg ml-4 shadow-md hover:bg-blue-700 transition"
                  onClick={applyCoupon}
                >
                  Apply
                </button>
              </div>
              {couponError && (
                <div className="mt-2 text-red-500">{couponError}</div>
              )}
              {selectedCoupon && (
                <div className="flex items-center justify-between mt-4 bg-green-100 p-3 rounded-lg">
                  <span className="text-green-600 font-semibold">
                    Applied: {selectedCoupon} (₹{discount} off)
                  </span>
                  <button
                    className="text-red-500 font-bold"
                    onClick={removeCoupon}
                  >
                    ✕ Remove
                  </button>
                </div>
              )}
              <button
                className="text-blue-600 mt-4 underline"
                onClick={() => setShowCoupons(!showCoupons)}
              >
                {showCoupons ? "Hide Offers" : "View Offers"}
              </button>
              {showCoupons && (
                <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                  {availableCoupons.map((c, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center p-3 border-b"
                    >
                      <div>
                        <span className="font-semibold text-gray-700">
                          {c.code}
                        </span>
                        <span className="text-green-600 ml-2">
                          ₹{c.discount} OFF
                        </span>
                      </div>
                      <button
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:bg-blue-700 transition"
                        onClick={() => selectCoupon(c.code, c.discount)}
                      >
                        Apply
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Bill Details
              </h2>
              <div className="flex justify-between py-2 text-gray-700">
                <span>Item Total</span>
                <span>₹{totalPrice.toFixed(2)}</span>
              </div>
              {selectedCoupon && (
                <div className="flex justify-between py-2 text-green-600">
                  <span>Coupon Discount</span>
                  <span>-₹{discount}</span>
                </div>
              )}
              <div className="flex justify-between py-2 text-gray-700">
                <span>Platform Fee</span>
                <span>₹{platformFee}</span>
              </div>
              <hr className="my-4" />
              <div className="flex justify-between text-lg font-bold text-gray-800">
                <span>TO PAY</span>
                <span>₹{finalAmount.toFixed(2)}</span>
              </div>
            </div>

            <button
              className="bg-green-600 text-white w-full py-4 rounded-lg mt-6 shadow-md hover:bg-green-700 transition"
              onClick={handleProceedToPayment}
            >
              Proceed to Payment
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cart;
