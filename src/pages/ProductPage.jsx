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
import Card from "../components/Card";
import SkeletonCard from "../components/SkeletonCard";

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState("");
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

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
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setProducts(productsList);
      setFilteredProducts(productsList);
      setLoading(false);
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
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        {/* Mobile Filter Toggle */}
        <div className="md:hidden mb-6">
          <button
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="flex items-center justify-between w-full px-4 py-3 bg-white rounded-lg shadow-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500"
          >
            <span className="font-medium text-gray-700">
              {isFilterOpen ? 'Hide Filters' : 'Show Filters'}
            </span>
            <svg
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${
                isFilterOpen ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters Sidebar */}
          <div
            className={`${
              isFilterOpen ? 'block' : 'hidden'
            } md:block w-full md:w-72 bg-white p-6 rounded-xl shadow-sm border border-gray-100 h-fit sticky top-6 transition-all duration-300`}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-800">Filters</h2>
              <button
                onClick={() => setSelectedCategory("")}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Clear all
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium text-gray-700">Categories</h3>
              <div className="space-y-2">
                <button
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                    selectedCategory === ""
                      ? 'bg-primary-100 text-primary-700 font-medium'
                      : 'hover:bg-gray-50 text-gray-600'
                  }`}
                  onClick={() => setSelectedCategory("")}
                >
                  All Categories
                </button>
                {categories.map((category) => (
                  <button
                    key={category.id}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors duration-200 ${
                      selectedCategory === category.id
                        ? 'bg-primary-100 text-primary-700 font-medium'
                        : 'hover:bg-gray-50 text-gray-600'
                    }`}
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {selectedCategory
                  ? categories.find((c) => c.id === selectedCategory)?.name + ' Products'
                  : 'All Products'}
              </h1>
              <p className="text-sm text-gray-500">
                Showing {filteredProducts.length} {filteredProducts.length === 1 ? 'item' : 'items'}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 8 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))}
              </div>
            ) : filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                  <Card
                    key={product.id}
                    product={product}
                    quantities={quantities}
                    cartItems={cartItems}
                    handleQuantityChange={handleQuantityChange}
                    addToCart={addToCart}
                    removeFromCart={removeFromCart}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-sm p-12 text-center">
                <svg
                  className="mx-auto h-12 w-12 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">
                  No products found
                </h3>
                <p className="mt-2 text-gray-500">
                  We couldn't find any products matching your selection.
                </p>
                <button
                  onClick={() => setSelectedCategory("")}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Clear filters
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;