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
import SkeletonCard from "../components/SkeletonCard"; // Import your SkeletonCard component

const ProductPage = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [userId, setUserId] = useState("");
  const [quantities, setQuantities] = useState({});
  const [cartItems, setCartItems] = useState({});
  const [loading, setLoading] = useState(true); // Add loading state

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
      setLoading(true); // Set loading to true before fetching data
      const querySnapshot = await getDocs(collection(db, "products"));
      const productsList = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      console.log(productsList);
      setProducts(productsList);
      setFilteredProducts(productsList);
      setLoading(false); // Set loading to false after data is fetched
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
          {loading
            ? Array.from({ length: 8 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))
            : filteredProducts.map((product) => (
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
      </div>
    </div>
  );
};

export default ProductPage;
