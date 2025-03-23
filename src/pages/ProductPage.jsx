import { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebaseConfig";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState("");
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState({});

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
    const fetchProducts = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(productsList);
      setProducts(productsList);
      setFilteredProducts(productsList);
    };

    const fetchCategories = async () => {
      const querySnapshot = await getDocs(collection(db, "categories"));
      const categoriesList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        name: doc.data().name,
      }));
      setCategories(categoriesList);
    };

    fetchProducts();
    fetchCategories();
  }, []);

  useEffect(() => {
    const fetchCartItems = async () => {
      if (!userId) return;
      const cartRef = doc(db, "carts", userId);
      const cartSnap = await getDoc(cartRef);
      if (cartSnap.exists()) {
        const cartData = cartSnap.data();
        const quantities = {};
        cartData.items.forEach((item) => {
          quantities[item.productId] = item.quantity;
        });
        setQuantities(quantities);
        setCartItems(
          cartData.items.reduce((acc, item) => {
            acc[item.productId] = true;
            return acc;
          }, {})
        );
      }
    };

    if (userId) {
      fetchCartItems();
    }
  }, [userId]);

  useEffect(() => {
    if (selectedCategory) {
      setFilteredProducts(
        products.filter((product) => product.categoryId === selectedCategory)
      );
    } else {
      setFilteredProducts(products);
    }
  }, [selectedCategory, products]);

  const handleQuantityChange = async (productId, quantity) => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    setQuantities((prevQuantities) => ({
      ...prevQuantities,
      [productId]: quantity,
    }));

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

  const addToCart = async (product) => {
    if (!userId) {
      console.error("User ID not found");
      return;
    }

    const quantity = quantities[product.id] || 1;
    const cartRef = doc(db, "carts", userId);
    const cartSnap = await getDoc(cartRef);

    if (cartSnap.exists()) {
      const existingItems = cartSnap.data().items || [];
      const updatedItems = existingItems.map((item) =>
        item.productId === product.id
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      const isNewProduct = !existingItems.some(
        (item) => item.productId === product.id
      );
      if (isNewProduct) {
        updatedItems.push({
          productId: product.id,
          quantity: quantity,
          price: product.price,
        });
      }
      await updateDoc(cartRef, {
        items: updatedItems,
        totalPrice: updatedItems.reduce(
          (total, item) => total + item.price * item.quantity,
          0
        ),
        userId: userId,
      });
    } else {
      // Create new cart
      await setDoc(cartRef, {
        items: [
          {
            productId: product.id,
            quantity: quantity,
            price: product.price,
          },
        ],
        totalPrice: product.price * quantity,
        userId: userId,
      });
    }

    setCartItems((prevCartItems) => ({
      ...prevCartItems,
      [product.id]: true,
    }));

    console.log("Added to cart:", product);
  };

  const removeFromCart = async (productId) => {
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

      setCartItems((prevCartItems) => {
        const newCartItems = { ...prevCartItems };
        delete newCartItems[productId];
        return newCartItems;
      });

      setQuantities((prevQuantities) => {
        const newQuantities = { ...prevQuantities };
        delete newQuantities[productId];
        return newQuantities;
      });

      console.log("Removed from cart:", productId);
    }
  };

  return (
    <div className="container mx-auto p-4 flex flex-col md:flex-row">
      <div className="w-full md:w-1/4 p-4">
        <h2 className="text-2xl font-bold mb-4">Filters</h2>
        <div>
          <button
            className={`block w-full text-left p-2 mb-2 ${
              selectedCategory === "" ? "bg-gray-200" : ""
            }`}
            onClick={() => setSelectedCategory("")}
          >
            All
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              className={`block w-full text-left p-2 mb-2 ${
                selectedCategory === category.id ? "bg-gray-200" : ""
              }`}
              onClick={() => setSelectedCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>
      </div>
      <div className="w-full md:w-3/4 p-4">
        <h1 className="text-3xl font-bold mb-4">Products</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="border rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow duration-300"
            >
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-48 object-cover mb-4 rounded"
              />
              <h2 className="text-xl font-semibold mb-2">{product.name}</h2>
              <p className="text-gray-700 mb-1">
                Price: &#8377;{product.price}
              </p>
              <p
                className={`text-gray-700 mb-1 ${
                  product.stock > 0 ? "text-green-500" : "text-red-500"
                }`}
              >
                {product.stock > 0 ? "In Stock" : "Out of Stock"}
              </p>
              {cartItems[product.id] ? (
                <div className="flex items-center mb-2">
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded-l"
                    onClick={() =>
                      handleQuantityChange(
                        product.id,
                        Math.max((quantities[product.id] || 1) - 1, 1)
                      )
                    }
                    disabled={quantities[product.id] <= 1}
                  >
                    -
                  </button>
                  <input
                    type="text"
                    className="w-12 text-center border-t border-b border-gray-300"
                    value={quantities[product.id] || 1}
                    onChange={(e) =>
                      handleQuantityChange(
                        product.id,
                        parseInt(e.target.value) || 1
                      )
                    }
                  />
                  <button
                    className="bg-gray-300 text-gray-700 px-2 py-1 rounded-r"
                    onClick={() =>
                      handleQuantityChange(
                        product.id,
                        (quantities[product.id] || 1) + 1
                      )
                    }
                  >
                    +
                  </button>
                  <button
                    className="bg-red-500 text-white px-4 py-2 rounded ml-2 hover:bg-red-600 transition-colors duration-300"
                    onClick={() => removeFromCart(product.id)}
                  >
                    Remove
                  </button>
                </div>
              ) : (
                <button
                  className="bg-blue-500 text-white px-4 py-2 rounded mt-2 hover:bg-blue-600 transition-colors duration-300"
                  onClick={() => addToCart(product)}
                  disabled={product.stock === 0}
                >
                  Add to Cart
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
